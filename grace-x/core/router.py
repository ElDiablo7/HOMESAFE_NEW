"""
Router — decides which model to use based on classified intent.
"""

import json
from pathlib import Path

from .classifier import classify
from .ollama_client import generate
from .memory import Memory


def load_config() -> dict:
    """Load config from config.json."""
    config_path = Path(__file__).parent.parent / "config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


# Map intent → config key → model name (easily extendable via config)
def get_model_for_intent(intent: str) -> str:
    """
    Map classified intent to Ollama model name.
    Falls back to reasoning model if intent unknown.
    """
    config = load_config()
    router = config.get("router", {})
    models = config.get("models", {})
    model_key = router.get(intent, "normal")
    return models.get(model_key, models.get("reasoning", "llama3:8b"))


def get_prompt_for_intent(intent: str) -> str:
    """Load system prompt for the given intent."""
    prompts_dir = Path(__file__).parent.parent / "prompts"
    mapping = {
        "greeting": "personality.txt",
        "casual": "personality.txt",
        "planning": "planner.txt",
        "analysis": "analyst.txt",
        "coding": "coder.txt",
        "normal": "system.txt",
    }
    filename = mapping.get(intent, "system.txt")
    prompt_path = prompts_dir / filename
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8").strip()
    return "You are GRACE-X, a helpful AI assistant."


def route(message: str, memory: Memory | None = None) -> tuple[str, str]:
    """
    Classify message, select model, inject memory, generate response.

    Returns:
        (response_text, model_used)
    """
    intent = classify(message)
    model = get_model_for_intent(intent)
    system_prompt = get_prompt_for_intent(intent)

    config = load_config()
    memory_context = ""
    history = []

    if memory and config.get("memory", {}).get("inject_context", True):
        short_term = memory.get_short_term()
        long_term = memory.get_long_term_summary()
        history = short_term
        if long_term:
            memory_context = f"\n\nRelevant context from past conversations:\n{long_term}"

    # Build full prompt: system + memory + conversation history + new message
    parts = [f"{system_prompt}{memory_context}"]
    for msg in history:
        prefix = "User" if msg.get("role") == "user" else "Assistant"
        parts.append(f"{prefix}: {msg.get('content', '')}")
    parts.append(f"User: {message}")

    full_prompt = "\n\n".join(parts)
    response = generate(model, full_prompt, history=None)

    if memory:
        memory.add_exchange(message, response)

    return response, model
