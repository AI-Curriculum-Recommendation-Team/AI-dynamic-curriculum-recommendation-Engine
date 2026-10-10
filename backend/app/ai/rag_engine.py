"""
RAG Engine (Retrieval-Augmented Generation)
Handles document text extraction, intelligent chunking, semantic vector embeddings,
similarity search, and grounded AI answer generation with source citations.
"""
import math
import re
from typing import List, Dict, Any, Optional
import pypdf

from app.ai.llm_client import _get_client, generate_content


def extract_text_from_file(file_path: str, filename: str) -> str:
    """Extract full plain text from PDF, TXT, or MD files."""
    if filename.lower().endswith(".pdf"):
        text_parts = []
        try:
            reader = pypdf.PdfReader(file_path)
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(f"[Page {page_idx + 1}]\n" + page_text)
            return "\n\n".join(text_parts).strip()
        except Exception as e:
            print(f"[RAG] Error extracting PDF text: {e}")
            # Try raw text read as fallback
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
            except Exception:
                return ""
    else:
        # Text or Markdown
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read().strip()
        except Exception as e:
            print(f"[RAG] Error reading file: {e}")
            return ""


def chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
    """Split text into semantically coherent overlapping chunks."""
    if not text:
        return []

    # Clean redundant whitespace
    cleaned = re.sub(r"\n{3,}", "\n\n", text)
    paragraphs = [p.strip() for p in cleaned.split("\n\n") if p.strip()]

    chunks: List[str] = []
    current_chunk = ""

    for para in paragraphs:
        if len(current_chunk) + len(para) <= chunk_size:
            current_chunk = f"{current_chunk}\n\n{para}".strip()
        else:
            if current_chunk:
                chunks.append(current_chunk)
            # If a single paragraph exceeds chunk size, split by sentences
            if len(para) > chunk_size:
                sentences = re.split(r"(?<=[.!?])\s+", para)
                sub_chunk = ""
                for sent in sentences:
                    if len(sub_chunk) + len(sent) <= chunk_size:
                        sub_chunk = f"{sub_chunk} {sent}".strip()
                    else:
                        if sub_chunk:
                            chunks.append(sub_chunk)
                        sub_chunk = sent
                if sub_chunk:
                    chunks.append(sub_chunk)
                current_chunk = ""
            else:
                current_chunk = para

    if current_chunk:
        chunks.append(current_chunk)

    # If chunks are still empty or too few, fallback to sliding character window
    if not chunks and text:
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunks.append(text[start:end])
            if end >= len(text):
                break
            start += chunk_size - overlap

    return chunks


def _fallback_dense_vector(text: str, dim: int = 64) -> List[float]:
    """Deterministic hash-based dense vector for offline/fallback similarity."""
    vec = [0.0] * dim
    words = re.findall(r"\w+", text.lower())
    if not words:
        return vec
    for w in words:
        idx = abs(hash(w)) % dim
        vec[idx] += 1.0
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec


def get_embeddings_batch(texts: List[str], batch_size: int = 20) -> List[List[float]]:
    """Batch generate vector embeddings using Gemini with fast fallback."""
    if not texts:
        return []

    results: List[List[float]] = []
    client = None
    try:
        client = _get_client()
    except Exception as e:
        print(f"[RAG] Failed to initialize Gemini client for batch embeddings: {e}")

    for i in range(0, len(texts), batch_size):
        batch = [t[:1200].strip() for t in texts[i:i + batch_size]]
        batch_results: List[List[float]] = []
        if client:
            try:
                res = client.models.embed_content(
                    model="models/gemini-embedding-001",
                    contents=batch,
                )
                if res.embeddings:
                    for idx_emb, emb in enumerate(res.embeddings):
                        if emb and emb.values:
                            batch_results.append(list(emb.values))
                        else:
                            batch_results.append(_fallback_dense_vector(batch[idx_emb]))
            except Exception as e:
                print(f"[RAG] Batch embedding error (falling back to dense vector): {e}")
                batch_results = [_fallback_dense_vector(t) for t in batch]
        else:
            batch_results = [_fallback_dense_vector(t) for t in batch]

        results.extend(batch_results)

    return results


def get_embedding(text: str) -> List[float]:
    """Generate vector embedding for a piece of text using Gemini embedding model."""
    try:
        client = _get_client()
        # Clean text snippet
        sample = text[:1500].strip()
        res = client.models.embed_content(
            model="models/gemini-embedding-001",
            contents=sample,
        )
        if res.embeddings and res.embeddings[0].values:
            return list(res.embeddings[0].values)
    except Exception as e:
        print(f"[RAG] Gemini embedding failed (using fallback vector): {e}")

    return _fallback_dense_vector(text)


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Compute cosine similarity between two float vectors."""
    if not v1 or not v2:
        return 0.0
    # Handle dimension mismatches gracefully
    min_len = min(len(v1), len(v2))
    if min_len == 0:
        return 0.0
    dot = sum(v1[i] * v2[i] for i in range(min_len))
    norm1 = math.sqrt(sum(v1[i] * v1[i] for i in range(min_len)))
    norm2 = math.sqrt(sum(v2[i] * v2[i] for i in range(min_len)))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def search_relevant_chunks(
    query: str,
    chunks_with_metadata: List[Dict[str, Any]],
    top_k: int = 4
) -> List[Dict[str, Any]]:
    """
    Search and rank chunks against query using cosine similarity.
    Each item in chunks_with_metadata should contain:
    - content: str
    - embedding: List[float]
    - filename: str
    - chunk_index: int
    - document_id: int
    """
    if not chunks_with_metadata:
        return []

    query_vec = get_embedding(query)
    scored = []

    for item in chunks_with_metadata:
        emb = item.get("embedding")
        score = 0.0
        if emb:
            score = cosine_similarity(query_vec, emb)
        else:
            # Word overlap keyword similarity fallback
            q_words = set(re.findall(r"\w+", query.lower()))
            c_words = set(re.findall(r"\w+", item["content"].lower()))
            overlap = len(q_words & c_words)
            score = overlap / max(1, len(q_words))

        scored.append((score, item))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for score, item in scored[:top_k]:
        item_copy = dict(item)
        item_copy["score"] = round(float(score), 4)
        # Avoid huge embedding payload in response
        item_copy.pop("embedding", None)
        results.append(item_copy)

    return results


def answer_with_rag(
    question: str,
    topic: str,
    retrieved_chunks: List[Dict[str, Any]],
    chat_history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """
    Generate grounded AI answer using retrieved context passages.
    Returns:
    {
        "answer": str,
        "sources": List[dict],
        "has_context": bool
    }
    """
    context_text = ""
    citations = []

    for idx, c in enumerate(retrieved_chunks):
        doc_name = c.get("filename", "Uploaded Material")
        snippet = c.get("content", "").strip()
        context_text += f"\n--- Source [{idx + 1}]: {doc_name} (Chunk #{c.get('chunk_index', 0)}) ---\n{snippet}\n"
        citations.append({
            "source_id": idx + 1,
            "filename": doc_name,
            "chunk_index": c.get("chunk_index", 0),
            "snippet": snippet[:200] + ("..." if len(snippet) > 200 else ""),
        })

    history_text = ""
    if chat_history:
        recent = chat_history[-6:]
        for msg in recent:
            role_label = "Student" if msg.get("role") == "user" else "Tutor"
            history_text += f"{role_label}: {msg.get('content', '')}\n"

    prompt = f"""You are CurriculumAI's intelligent, patient study tutor for the topic "{topic}".

Your goal is to explain concepts clearly, step-by-step, and ground your answers in the student's study documents.

Retrieved Context from Student's Knowledge Base:
\"\"\"
{context_text if context_text else "No uploaded documents matched this query."}
\"\"\"

Recent Conversation:
{history_text}

Student Question: {question}

Instructions:
1. If the retrieved context contains relevant info, prioritize it and cite the source name/section.
2. If the context does not fully cover the question, provide a solid, accurate explanation based on standard computer science principles and curriculum knowledge, but clarify that it is general guidance.
3. Use friendly markdown formatting: bullet points, code blocks where helpful, and bold key terms.
4. Keep the answer clear, encouraging, and pedagogically rich.
"""

    answer_text = generate_content(prompt)
    if not answer_text:
        answer_text = (
            f"Here is what you need to know about **{topic}**:\n\n"
            f"Regarding your question *'{question}'*, key foundational principles include breaking down the problem, "
            "reviewing the core documentation, and practicing with hands-on coding examples. "
            "Please check your uploaded materials or ask for a specific code walkthrough!"
        )

    return {
        "answer": answer_text,
        "sources": citations if context_text else [],
        "has_context": bool(context_text.strip()),
    }
