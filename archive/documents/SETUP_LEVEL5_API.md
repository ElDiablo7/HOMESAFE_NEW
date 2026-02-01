# Level 5 API Setup Guide

Quick setup guide for enabling GRACE-X Level 5 Brain API integration.

## Prerequisites

- Node.js 14+ installed
- API key from OpenAI or Anthropic

## Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

## Step 2: Configure API Key

1. Copy the example environment file:
   ```bash
   # Windows
   copy env.example.txt .env
   
   # Mac/Linux
   cp env.example.txt .env
   ```

2. Edit `.env` and add your API key:
   ```
   LLM_PROVIDER=openai
   API_KEY=sk-your-actual-api-key-here
   ```

## Step 3: Start Backend Server

```bash
npm start
```

You should see:
```
🚀 GRACE-X Brain API Server running on http://localhost:3000
📡 Health check: http://localhost:3000/health
🧠 Brain endpoint: http://localhost:3000/api/brain
```

## Step 4: Enable API in Frontend

1. Open `index.html`
2. Find the commented API configuration section
3. Uncomment it:
   ```html
   <script>
     window.GRACEX_BRAIN_API = 'http://localhost:3000/api/brain';
   </script>
   ```

## Step 5: Test

1. Start your frontend server:
   ```bash
   python -m http.server 8000
   ```

2. Open http://localhost:8000

3. Test a module - you should now get Level 5 (LLM) responses instead of Level 1 (keyword) responses.

## Verification

### Check Backend Health
Visit: http://localhost:3000/health

Should return:
```json
{
  "status": "ok",
  "service": "GRACE-X Brain API",
  "version": "1.0.0"
}
```

### Check Frontend Console
Open browser console (F12) and look for:
```
[GRACEX] Level 5 Brains loaded. API endpoint: http://localhost:3000/api/brain
```

If you see "Not configured (using Level 1 fallback)", the API endpoint isn't set correctly.

## Troubleshooting

### "API key not configured"
- Make sure `.env` file exists in `server/` directory
- Check that `API_KEY` is set in `.env`
- Restart the server after changing `.env`

### "Failed to get AI response"
- Verify your API key is valid
- Check you have credits/quota with your provider
- Check backend server is running
- Check browser console for CORS errors

### CORS Errors
- Make sure backend server is running
- Check that `cors` package is installed (`npm install` in server/)
- Verify API endpoint URL in `index.html` matches backend URL

### Still Using Level 1 (Keyword) Responses
- Check `index.html` - API configuration script must be uncommented
- Check browser console for API endpoint message
- Verify backend server is running and accessible
- Test health endpoint: http://localhost:3000/health

## Getting API Keys

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy and paste into `.env` file

**Recommended model:** `gpt-4o-mini` (cost-effective, high quality)

### Anthropic Claude
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Create a new API key
4. Copy and paste into `.env` file
5. Set `LLM_PROVIDER=anthropic` in `.env`

**Recommended model:** `claude-3-haiku-20240307` (fast, cost-effective)

## Cost Considerations

- **OpenAI GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **OpenAI GPT-3.5-turbo**: ~$0.50 per 1M input, ~$1.50 per 1M output
- **Anthropic Claude Haiku**: Similar pricing to GPT-4o-mini

For testing, GPT-4o-mini or Claude Haiku are recommended.

## Next Steps

Once Level 5 is working:
1. Test all modules to verify LLM responses
2. Fine-tune system prompts in `assets/js/brainLevel5.js`
3. Adjust `max_tokens` and `temperature` in backend if needed
4. Set up production deployment (see `server/README.md`)
