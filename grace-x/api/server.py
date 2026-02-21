"""
FastAPI server — exposes /grace/chat endpoint for UI integration.
"""

import sys
from pathlib import Path

# Ensure grace-x root is on path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI
from pydantic import BaseModel

from core.router import route
from core.memory import Memory

app = FastAPI(title="GRACE-X ULTIMATE", version="1.0.0")

# Session memory — persists for server lifetime
memory = Memory()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    model_used: str


@app.post("/grace/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Receive message, route to model, return response and model used.
    """
    response_text, model_used = route(request.message, memory=memory)
    return ChatResponse(response=response_text, model_used=model_used)


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "grace-x"}
