# GRACE-X Level 5 Brains™ Setup Guide

## Overview

Level 5 Brains upgrade the system from simple keyword matching (Level 1) to advanced AI with:
- **External LLM Integration** (OpenAI, Anthropic, etc.)
- **Conversation Memory** - remembers context across messages
- **Module-Specific Intelligence** - each module has tailored system prompts
- **Graceful Fallback** - automatically falls back to Level 1 if API unavailable

## Current Status

✅ **Level 5 Brain System** - Implemented and ready
⏳ **API Backend** - Needs to be set up
✅ **Fallback System** - Works with existing Level 1 brains

## Setup Options

### Option 1: Backend Proxy (Recommended)

Create a backend endpoint that proxies to your LLM provider:

**Example Node.js/Express:**
```javascript
// server.js
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/brain', async (req, res) => {
  const { module, messages } = req.body;
  
  // Call your LLM (OpenAI, Anthropic, etc.)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // or gpt-3.5-turbo for cheaper
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    })
  });
  
  const data = await response.json();
  res.json({ reply: data.choices[0].message.content });
});

app.listen(3000);
```

**Then configure in your app:**
```javascript
// In index.html or a config file, before brainLevel5.js loads:
window.GRACEX_BRAIN_API = 'http://localhost:3000/api/brain';
```

### Option 2: Direct Client-Side (Not Recommended)

⚠️ **Security Warning**: Never expose API keys in client-side code!

If you must use client-side, use a service like:
- **OpenAI** (requires API key in backend)
- **Anthropic Claude** (requires API key in backend)
- **Local LLM** (Ollama, etc.)

### Option 3: Hybrid Mode (Current Default)

The system automatically falls back to Level 1 (keyword) brains if:
- API endpoint not configured
- API call fails
- Network error

This ensures the app always works, even without Level 5.

## Configuration

### Enable Level 5 for Specific Modules

Edit `assets/js/brainLevel5.js`:

```javascript
// Set API endpoint
window.GRACEX_BRAIN_API = 'https://your-api.com/brain';

// Or configure per-module
BRAIN_CONFIG.apiEndpoint = '/api/brain';
BRAIN_CONFIG.fallbackMode = 'hybrid'; // 'hybrid' or 'keyword'
BRAIN_CONFIG.enableMemory = true;
```

### Customize System Prompts

Edit the `systemPrompts` object in `brainLevel5.js` to tailor each module's personality and expertise.

## Features

### Conversation Memory
- Remembers last 10 messages per module
- Context-aware responses
- Clear history function available

### Module-Specific Intelligence
Each module has a custom system prompt:
- **Builder**: Construction, measurements, safety
- **Uplift**: Mental health, grounding, support
- **Chef**: Cooking, meal planning, budgets
- **OSINT**: Ethical information gathering
- etc.

### Graceful Degradation
- Works offline (Level 1 fallback)
- No breaking changes to existing code
- Seamless upgrade path

## Testing

1. **Test Level 1 (Current):**
   - Don't set `GRACEX_BRAIN_API`
   - System uses keyword brains

2. **Test Level 5:**
   - Set up backend proxy
   - Configure `GRACEX_BRAIN_API`
   - System uses LLM with memory

3. **Test Fallback:**
   - Configure API endpoint
   - Disconnect network or use invalid endpoint
   - System falls back to Level 1

## API Response Format

Your backend should return:
```json
{
  "reply": "The AI's response text here"
}
```

Or OpenAI format:
```json
{
  "choices": [{
    "message": {
      "content": "The AI's response text here"
    }
  }]
}
```

## Next Steps

1. ✅ Level 5 brain system implemented
2. ⏳ Set up backend API proxy
3. ⏳ Configure API endpoint
4. ⏳ Test with real LLM
5. ⏳ Fine-tune system prompts per module
6. ⏳ Add conversation history UI (optional)

## Cost Considerations

- **OpenAI GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **OpenAI GPT-3.5-turbo**: ~$0.50 per 1M input, ~$1.50 per 1M output
- **Anthropic Claude**: Similar pricing
- **Local LLM (Ollama)**: Free but requires local server

For a prototype, GPT-4o-mini is cost-effective and high-quality.

## Security Notes

- Never expose API keys in client code
- Always use a backend proxy
- Rate limit API calls
- Sanitize user input
- Consider user privacy for conversation history

