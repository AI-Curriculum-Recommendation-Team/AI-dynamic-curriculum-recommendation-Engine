"""
AI Study Assistant for Flashcard generation and Document/Topic Notes Summarization.
"""
from typing import List, Dict, Any, Optional
from app.ai.llm_client import generate_json_content, generate_content


def generate_notes_summary(content: str, title: str) -> Dict[str, Any]:
    """
    Summarize document text or topic syllabus into comprehensive, structured study notes.
    """
    sample_text = content[:12000].strip() if content else ""

    prompt = f"""You are an expert academic tutor and note-taker.
Create comprehensive, clear, and high-yield study notes for: "{title}".

Source Content:
\"\"\"
{sample_text if sample_text else f"Topic title: {title}"}
\"\"\"

Return a valid JSON object with EXACTLY this structure:
{{
  "title": "{title}",
  "summary_text": "Detailed multi-paragraph markdown study notes covering Core Concepts, How It Works, Code/Syntax Patterns, and Common Pitfalls. Use markdown headings, bullet points, and code snippets.",
  "key_takeaways": [
    "Takeaway 1: Essential principle",
    "Takeaway 2: Key syntax or workflow point",
    "Takeaway 3: Best practice or gotcha to remember",
    "Takeaway 4: Interview or practical application tip"
  ]
}}
Do NOT include markdown fences outside the JSON. Return only the JSON object.
"""

    result = generate_json_content(prompt)
    if result and isinstance(result, dict) and "summary_text" in result:
        return {
            "title": result.get("title", title),
            "summary_text": result.get("summary_text", ""),
            "key_takeaways": result.get("key_takeaways", []),
        }

    # Fallback if JSON generation or quota issue occurs
    fallback_summary = f"""# Comprehensive Study Notes: {title}

## 1. Overview & Core Concept
{title} represents a fundamental competency in your target curriculum. Understanding the theoretical foundations and implementation details provides the groundwork for real-world projects and technical interviews.

## 2. Key Architecture & Principles
- **Core Abstraction:** Breaks down complex problems into modular, testable components.
- **Workflow:** Involves input preprocessing, core algorithmic execution, and structured result validation.
- **Efficiency:** Prioritize optimal space and time complexities when applying this concept in production.

## 3. Best Practices
- Always write reproducible examples and verify edge cases.
- Follow industry coding conventions and document key trade-offs.
- Integrate automated unit testing for critical workflows.
"""
    return {
        "title": title,
        "summary_text": fallback_summary,
        "key_takeaways": [
            f"Master the core primitives and APIs of {title}",
            "Understand trade-offs and runtime characteristics",
            "Build practical hands-on exercises to reinforce learning",
            "Test thoroughly against edge cases and invalid inputs",
        ],
    }


def generate_flashcards_ai(content: str, topic: str, count: int = 6) -> List[Dict[str, str]]:
    """
    Generate interactive Q&A flashcards for a given topic or document.
    """
    sample_text = content[:8000].strip() if content else ""

    prompt = f"""You are an expert educator. Create {count} high-yield study flashcards for the topic: "{topic}".

Source Content:
\"\"\"
{sample_text if sample_text else f"Topic: {topic}"}
\"\"\"

Return a valid JSON array of objects. Each object must have:
- "front_text": A clear, direct question or concept prompt.
- "back_text": A concise, memorable answer or explanation (1-3 sentences).
- "difficulty": "easy", "medium", or "hard".

Example JSON format:
[
  {{
    "front_text": "What is the primary purpose of {topic}?",
    "back_text": "It provides...",
    "difficulty": "easy"
  }}
]
Do NOT wrap in anything other than the JSON array or standard json block.
"""

    result = generate_json_content(prompt)
    if isinstance(result, list) and len(result) > 0:
        cleaned = []
        for item in result:
            if isinstance(item, dict) and "front_text" in item and "back_text" in item:
                cleaned.append({
                    "front_text": str(item["front_text"]).strip(),
                    "back_text": str(item["back_text"]).strip(),
                    "difficulty": str(item.get("difficulty", "medium")).lower(),
                })
        if cleaned:
            return cleaned

    # Fallback flashcards
    return [
        {
            "front_text": f"What is the definition and role of {topic}?",
            "back_text": f"{topic} is an essential discipline that enables building scalable, high-performance systems and algorithms.",
            "difficulty": "easy",
        },
        {
            "front_text": f"What are two primary advantages of utilizing {topic}?",
            "back_text": "Improved efficiency and maintainability, along with standardized design patterns that reduce runtime bugs.",
            "difficulty": "medium",
        },
        {
            "front_text": f"What common challenge arises when deploying {topic} in production?",
            "back_text": "Handling scaling bottlenecks, data drift, and maintaining proper error-handling and telemetry.",
            "difficulty": "hard",
        },
        {
            "front_text": f"How do you test and validate implementations of {topic}?",
            "back_text": "By writing modular unit tests, simulating edge cases, and benchmarking latency and resource utilization.",
            "difficulty": "medium",
        },
    ]
