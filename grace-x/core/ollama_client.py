"""
Ollama API client — sends prompts to local models and returns text responses.
"""

import json
from pathlib import Path

import requests


def load_config() -> dict:
    """Load config from config.json."""
    config_path = Path(__file__).parent.parent / "config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def generate(model: str, prompt: str, history: list | None = None, stream: bool = False) -> str:
    """
    Send a prompt to a local Ollama model and return the text response.

    Args:
        model: Ollama model name (e.g. phi3, llama3:8b)
        prompt: The user prompt
        history: Optional list of [{"role": "user/assistant", "content": "..."}] for context
        stream: If True, stream response (not implemented — returns full text)

    Returns:
        Generated text response, or empty string on error
    """
    config = load_config()
    base_url = config["ollama"]["base_url"].rstrip("/")
    endpoint = f"{base_url}{config['ollama']['generate_endpoint']}"

    # Build context from history if provided
    context_prompt = prompt
    if history:
        context_lines = []
        for msg in history[-config["memory"]["short_term_max"] * 2 :]:  # user + assistant pairs
            role = msg.get("role", "user")
            content = msg.get("content", "")
            prefix = "User" if role == "user" else "Assistant"
            context_lines.append(f"{prefix}: {content}")
        if context_lines:
            context_prompt = "\n".join(context_lines) + f"\n\nUser: {prompt}"

    payload = {
        "model": model,
        "prompt": context_prompt,
        "stream": stream,
    }

    try:
        resp = requests.post(endpoint, json=payload, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        return data.get("response", "").strip()
    except requests.exceptions.RequestException as e:
        return f"[Error: Could not reach Ollama: {e}]"
    except (KeyError, json.JSONDecodeError) as e:
        return f"[Error: Invalid response from Ollama: {e}]"
