"""
Intent classifier — examines messages and assigns a task type for routing.
"""

import json
import re
from pathlib import Path


def load_config() -> dict:
    """Load config from config.json."""
    config_path = Path(__file__).parent.parent / "config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


# Keyword patterns for intent detection — easily extendable
GREETING_PATTERNS = [
    r"^(hi|hey|hello|hey there|howdy|greetings|good (morning|afternoon|evening)|yo)\b",
    r"\b(hi|hey|hello)\s*(grace|x|there)?\s*[?!.]?\s*$",
    r"^(what'?s up|sup|wassup|how are you|how'?s it going)\b",
]

CASUAL_PATTERNS = [
    r"\b(thanks|thank you|ok|okay|cool|nice|great|awesome)\b",
    r"\b(bye|goodbye|see you|later)\b",
]

PLANNING_PATTERNS = [
    r"\b(plan|steps?|how to|guide|instruction|walkthrough)\b",
    r"\b(organize|schedule|outline|roadmap)\b",
    r"\b(what (are|is) the (steps|process)|break down)\b",
]

ANALYSIS_PATTERNS = [
    r"\b(why|evaluate|analy[sz]e|compare|explain (why|how))\b",
    r"\b(pros? and cons?|trade.?off|implications)\b",
    r"\b(what (does|do|is)|reason for|cause of)\b",
]

CODING_PATTERNS = [
    r"\b(code|coding|programming|script|function|algorithm)\b",
    r"\b(build|implement|create (a|an)|write (a|an))\s*\w*(app|program|script|code)\b",
    r"\b(python|javascript|typescript|rust|go)\s+\w+\b",
    r"\b(debug|refactor|api|sql|html|css)\b",
]


def classify(message: str) -> str:
    """
    Classify user message intent and return router key.

    Returns one of: greeting, casual, planning, analysis, coding, normal
    """
    text = (message or "").strip().lower()
    if not text:
        return "normal"

    # Check in priority order (most specific first)
    for pattern in GREETING_PATTERNS:
        if re.search(pattern, text, re.I):
            return "greeting"

    for pattern in CASUAL_PATTERNS:
        if re.search(pattern, text, re.I):
            return "casual"

    for pattern in CODING_PATTERNS:
        if re.search(pattern, text, re.I):
            return "coding"

    for pattern in PLANNING_PATTERNS:
        if re.search(pattern, text, re.I):
            return "planning"

    for pattern in ANALYSIS_PATTERNS:
        if re.search(pattern, text, re.I):
            return "analysis"

    return "normal"
