import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.student import Student
from app.models.v3_models import Document, DocumentChunk
from app.schemas.v3_schemas import DocumentOut, DocumentChunkOut
from app.ai.rag_engine import extract_text_from_file, chunk_text, get_embeddings_batch
from app.services.v2_service import award_badge

router = APIRouter(prefix="/documents", tags=["V3 Documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Upload a PDF, TXT, or MD study document into the student's personal knowledge base."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    filename = file.filename or "document.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".txt", ".md", ".json"]:
        raise HTTPException(status_code=400, detail="Only PDF, TXT, and Markdown files are supported.")

    # Save file safely
    safe_name = f"std_{student.id}_{int(os.times().system * 1000)}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    # Create document record
    doc = Document(
        student_id=student.id,
        filename=filename,
        file_path=file_path,
        mime_type=file.content_type or ("application/pdf" if ext == ".pdf" else "text/plain"),
        file_size=file_size,
        is_indexed=False,
        chunk_count=0,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Automatically trigger fast extraction and batch indexing
    try:
        raw_text = extract_text_from_file(file_path, filename)
        if raw_text:
            chunks = chunk_text(raw_text, chunk_size=1000, overlap=100)[:60]
            embeddings = get_embeddings_batch(chunks, batch_size=20)
            for idx, (c_text, emb) in enumerate(zip(chunks, embeddings)):
                chunk = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=idx,
                    content=c_text,
                    vector_id=f"doc_{doc.id}_chk_{idx}",
                    embedding=emb,
                )
                db.add(chunk)
            doc.is_indexed = True
            doc.chunk_count = len(chunks)
            db.commit()
            db.refresh(doc)
    except Exception as e:
        print(f"[RAG] Automatic indexing encountered warning: {e}")

    award_badge(db, student.id, "KNOWLEDGE_EXPLORER")
    return doc


@router.get("", response_model=List[DocumentOut])
@router.get("/", response_model=List[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: List all uploaded study documents in the student's knowledge base."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return (
        db.query(Document)
        .filter(Document.student_id == student.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Delete a document and all its indexed vector chunks."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.student_id == student.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove physical file if exists
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document and semantic vector index successfully deleted."}


@router.post("/{document_id}/index", response_model=DocumentOut)
def index_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Trigger re-indexing into vector DB for a document."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.student_id == student.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Clear existing chunks
    db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).delete()

    raw_text = extract_text_from_file(doc.file_path, doc.filename)
    if not raw_text:
        raise HTTPException(status_code=400, detail="Could not extract text from document.")

    chunks = chunk_text(raw_text, chunk_size=1000, overlap=100)[:60]
    embeddings = get_embeddings_batch(chunks, batch_size=20)
    for idx, (c_text, emb) in enumerate(zip(chunks, embeddings)):
        chunk = DocumentChunk(
            document_id=doc.id,
            chunk_index=idx,
            content=c_text,
            vector_id=f"doc_{doc.id}_chk_{idx}",
            embedding=emb,
        )
        db.add(chunk)

    doc.is_indexed = True
    doc.chunk_count = len(chunks)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{document_id}/chunks", response_model=List[DocumentChunkOut])
def get_document_chunks(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """V3: Inspect extracted vector chunks for a document."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.student_id == student.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return doc.chunks
