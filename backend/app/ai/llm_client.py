"""
Google Gemini API client for AI curriculum generation.
Uses gemini-1.5-flash model (free tier friendly).
"""
import json
import re
from typing import Optional
import google.generativeai as genai
from app.core.config import settings


def _get_model():
    """Initialize and return the Gemini model."""
    genai.configure(api_key=settings.GEMINI_API_KEY)
    # Prefer gemini-2.5-flash or gemini-flash-latest
    for model_name in ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"]:
        try:
            return genai.GenerativeModel(
                model_name=model_name,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 8192,
                }
            )
        except Exception:
            continue
    return genai.GenerativeModel(model_name="gemini-2.5-flash")


def generate_content(prompt: str) -> Optional[str]:
    """Send a prompt to Gemini and return the text response."""
    try:
        model = _get_model()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None


def generate_json_content(prompt: str) -> Optional[dict]:
    """Send a prompt and parse the JSON response."""
    response_text = generate_content(prompt)
    if not response_text:
        return None

    # Extract JSON from the response (handle markdown code blocks)
    json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text)
    if json_match:
        json_str = json_match.group(1)
    else:
        json_str = response_text.strip()

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        # Try to find JSON object in text
        obj_match = re.search(r"\{[\s\S]*\}", response_text)
        if obj_match:
            try:
                return json.loads(obj_match.group())
            except Exception:
                pass
        print(f"Failed to parse JSON: {response_text[:200]}")
        return None
