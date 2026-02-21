# GRACE-X ULTIMATE — Backend Intelligence Layer

Modular offline AI system that routes prompts to specialized local Ollama models. Acts as an intelligence dispatcher, not a chatbot.

## Requirements

- Python 3.10+
- [Ollama](https://ollama.ai) installed and running locally
- Models pulled: `phi3`, `llama3:8b`, `mistral`, `qwen:7b`, `deepseek-coder`

## Install

```bash
cd grace-x
pip install -r requirements.txt
```

## Run Ollama

Start Ollama before the server (if not already running):

```bash
ollama serve
```

Pull models as needed:

```bash
ollama pull phi3
ollama pull llama3:8b
ollama pull mistral
ollama pull qwen:7b
ollama pull deepseek-coder
```

## Run Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn api.server:app --host 0.0.0.0 --port 8000
```

Server runs at `http://localhost:8000`.

## API

### POST /grace/chat

Send a message and receive a routed response.

**Request:**

```json
{
  "message": "Hello, how are you?"
}
```

**Response:**

```json
{
  "response": "I'm doing well, thanks for asking! How can I help you today?",
  "model_used": "phi3"
}
```

## Test with curl

```bash
curl -X POST http://localhost:8000/grace/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Hello!\"}"
```

Example output:

```json
{"response":"Hi there! How can I help you today?","model_used":"phi3"}
```

## Project Structure

```
grace-x/
├── main.py              # Entry point
├── config.json          # Models, memory, router rules
├── requirements.txt
├── README.md
├── core/
│   ├── router.py        # Intent → model routing
│   ├── classifier.py    # Message intent classification
│   ├── memory.py        # Short/long-term memory
│   └── ollama_client.py # Ollama API client
├── prompts/
│   ├── personality.txt  # phi3 style
│   ├── planner.txt      # mistral style
│   ├── analyst.txt      # qwen style
│   └── system.txt       # Default
├── modules/
│   ├── builder.py       # Extensible
│   ├── uplift.py        # Extensible
│   └── tools.py         # Extensible
└── api/
    └── server.py        # FastAPI /grace/chat
```

## Routing

| Intent   | Model           |
|----------|-----------------|
| Greeting / casual | phi3 |
| Normal questions  | llama3:8b |
| Planning / steps  | mistral |
| Analysis / why    | qwen:7b |
| Coding / technical| deepseek-coder |

Edit `config.json` to change models or add router rules.
