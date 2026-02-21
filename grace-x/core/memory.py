"""
Memory system — short-term (session) and long-term (JSON file) conversation storage.
"""

import json
from pathlib import Path


def load_config() -> dict:
    """Load config from config.json."""
    config_path = Path(__file__).parent.parent / "config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


class Memory:
    """
    Manages short-term (last N messages) and long-term (persistent JSON) memory.
    """

    def __init__(self):
        self._short_term: list[dict] = []
        config = load_config()
        self._max_short = config.get("memory", {}).get("short_term_max", 10)
        self._long_term_path = Path(__file__).parent.parent / config.get("memory", {}).get(
            "long_term_path", "memory/conversations.json"
        )

    def add_exchange(self, user_msg: str, assistant_msg: str) -> None:
        """Append one user/assistant exchange to short-term and long-term."""
        pair = [
            {"role": "user", "content": user_msg},
            {"role": "assistant", "content": assistant_msg},
        ]
        self._short_term.extend(pair)
        if len(self._short_term) > self._max_short * 2:
            self._short_term = self._short_term[-(self._max_short * 2) :]

        # Append to long-term JSON
        self._long_term_path.parent.mkdir(parents=True, exist_ok=True)
        data = []
        if self._long_term_path.exists():
            try:
                with open(self._long_term_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except (json.JSONDecodeError, IOError):
                data = []
        data.append({"user": user_msg, "assistant": assistant_msg})
        with open(self._long_term_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def get_short_term(self) -> list[dict]:
        """Return last N messages as [{role, content}, ...]."""
        return self._short_term.copy()

    def get_long_term_summary(self, last_n: int = 5) -> str:
        """
        Return a brief summary of recent long-term exchanges for context injection.
        """
        if not self._long_term_path.exists():
            return ""
        try:
            with open(self._long_term_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, IOError):
            return ""
        recent = data[-last_n:] if isinstance(data, list) else []
        lines = []
        for item in recent:
            if isinstance(item, dict):
                u = item.get("user", "")[:80]
                a = item.get("assistant", "")[:120]
                lines.append(f"- User: {u}... → Assistant: {a}...")
        return "\n".join(lines) if lines else ""
