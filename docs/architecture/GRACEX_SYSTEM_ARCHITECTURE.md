# GRACE-X System Architecture
## Router Integration Pass — Real Repo Patch

**Date:** 2026-03-09  
**Author:** GRACE-X HomeSafe Patch  
**Version:** v6.6.0 → v6.7.0-router

---

## System Overview

```
User Request
  → /api/brain
  → Feature Flag Check (USE_BRAIN_ROUTER)
  ├─ false → Legacy Level 5 Path (unchanged)
  └─ true  → Brain Router
              → Task Classifier (module → brain)
              → Brain Selection (core/analysis/utility/sovereign)
              → Provider Layer (OpenAI → Ollama failover)
              → Response
```

## Architecture Components

### Backend Entrypoint
- **File:** `server/server.js`
- **Framework:** Express.js
- **Port:** 3000
- **Boot:** `START.bat` → `node server/server.js`

### Brain Router (`server/router/`)
| File | Purpose |
|------|---------|
| `brain_router.js` | Orchestrates classify → brain → provider → response |
| `task_classifier.js` | Deterministic module → brain mapping |

### Brain Modules (`server/brains/`)
| File | Brain | Handles |
|------|-------|---------|
| `core_brain.js` | Core | core, uplift, guardian, family, callassist |
| `analysis_brain.js` | Analysis | builder, siteops, sport, tradelink, osint, accounting, forge |
| `utility_brain.js` | Utility | fit, yoga, chef, beauty, artist, gamer |
| `sovereign_brain.js` | Sovereign | All unmapped/future modules |

### Provider Layer (`server/providers/`)
| File | Provider | Type |
|------|----------|------|
| `openai_provider.js` | OpenAI | Primary (real API calls, retry, timeout) |
| `ollama_provider.js` | Ollama | Fallback (local HTTP, safe failure) |
| `provider_registry.js` | Registry | Manages failover: OpenAI → Ollama |

### Feature Flag
```
# In server/.env or root .env
USE_BRAIN_ROUTER=false   # Legacy (default)
USE_BRAIN_ROUTER=true    # New router
```

## API Endpoints

### Existing (Unchanged)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/brain` | Main brain endpoint (feature-flag gated) |
| GET | `/api/providers` | List available providers |

### New Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/brain-router-test` | Test router independently (never touches legacy) |
| GET | `/api/brain-router/status` | Router status + feature flag state |

## Request Flow

### Legacy Mode (USE_BRAIN_ROUTER=false)
```
POST /api/brain → validate → build system prompt → try providers in order
                  (openai → anthropic → openrouter → ollama) → respond
```

### Router Mode (USE_BRAIN_ROUTER=true)
```
POST /api/brain → validate → build system prompt → feature flag check
                → task_classifier.classify(module) → brain.prepareMessages()
                → provider_registry.callWithFailover() → brain.postProcess()
                → respond with brain/provider metadata
```

### Router Test (Always Active)
```
POST /api/brain-router-test → validate → build system prompt
                             → brain router pipeline → respond with full metadata
```

## Rollback

Immediate rollback by setting:
```
USE_BRAIN_ROUTER=false
```
Then restart the server. The legacy code path is **never deleted** — it remains fully intact.

If the router itself has issues while `USE_BRAIN_ROUTER=true`, the `/api/brain` handler **automatically falls back** to the legacy path on any router error.

## Files Modified
- `server/server.js` — Added brain router require, feature flag gate, test endpoint, status endpoint
- `server/.env` — Added `USE_BRAIN_ROUTER=false`
- `.env` (root) — Added `USE_BRAIN_ROUTER=false`

## Files Created
- `server/router/brain_router.js`
- `server/router/task_classifier.js`
- `server/brains/core_brain.js`
- `server/brains/analysis_brain.js`
- `server/brains/utility_brain.js`
- `server/brains/sovereign_brain.js`
- `server/providers/openai_provider.js`
- `server/providers/ollama_provider.js`
- `server/providers/provider_registry.js`
