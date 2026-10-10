"""
Google Gemini API client using the new google-genai SDK.
Model priority: gemini-3.6-flash → gemini-2.5-flash → gemini-flash-latest
"""
import json
import re
import warnings
from typing import Optional

# Suppress harmless AFC (automatic function calling) FutureWarning from SDK
warnings.filterwarnings("ignore", category=FutureWarning, module="google")

from google import genai
from google.genai import types
from app.core.config import settings

# Model preference order — fast and high-quota models first
_MODEL_PREFERENCE = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
]


def _get_client() -> genai.Client:
    """Return a configured Gemini client."""
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def _pick_model(client: genai.Client) -> str:
    """Return the first preferred model."""
    return _MODEL_PREFERENCE[0]


def generate_content(prompt: str) -> Optional[str]:
    """Send a prompt to Gemini and return the text response."""
    client = _get_client()

    for attempt_model in _MODEL_PREFERENCE:
        try:
            response = client.models.generate_content(
                model=attempt_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    top_p=0.95,
                    top_k=40,
                    max_output_tokens=8192,
                ),
            )
            text = response.text
            if text:
                return text
        except Exception as e:
            err = str(e)
            print(f"[LLM] {attempt_model} failed: {err[:160]}")
            continue

    print("[LLM] All models exhausted.")
    return None


def generate_json_content(prompt: str) -> Optional[dict]:
    """Send a prompt and parse the JSON response."""
    response_text = generate_content(prompt)
    if not response_text:
        return None

    # Strip markdown code fences if present
    json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text)
    if json_match:
        json_str = json_match.group(1)
    else:
        json_str = response_text.strip()

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        # Try to extract a JSON object from the raw text
        obj_match = re.search(r"\{[\s\S]*\}", response_text)
        if obj_match:
            try:
                return json.loads(obj_match.group())
            except Exception:
                pass
        print(f"[LLM] Failed to parse JSON from response:\n{response_text[:300]}")
        return None
