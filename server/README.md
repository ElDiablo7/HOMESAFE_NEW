# GRACE-X Level 5 Brain API Server v2.0

Enhanced backend proxy server for GRACE-X Level 5 brain integration with multiple LLM providers.

## ✨ Features

- **Multi-Provider Support**: OpenAI, Anthropic Claude, OpenRouter, and Ollama (local)
- **Security**: Helmet.js headers, input sanitization, rate limiting
- **Logging**: Request/response logging with configurable levels
- **Request Tracking**: Unique request IDs for debugging
- **Graceful Shutdown**: Proper cleanup on termination
- **Validation**: Input validation and error handling

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Configure API key
```bash
# Windows
copy env.example.txt .env

# Mac/Linux
cp env.example.txt .env
```

Edit `.env` and add your API key.

### 3. Start the server
```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

### 4. Update frontend configuration
The frontend should already be configured in `index.html`:
```html
<script>
  window.GRACEX_BRAIN_API = 'http://localhost:3000/api/brain';
</script>
```

## 🔧 Configuration

### Environment Variables (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `openai` | Provider: `openai`, `anthropic`, `openrouter`, `ollama` |
| `API_KEY` | - | Your API key (generic) |
| `PORT` | `3000` | Server port |
| `RATE_LIMIT_MAX` | `30` | Requests per minute |
| `LOG_LEVEL` | `info` | Logging: `error`, `warn`, `info`, `debug` |

### Provider-Specific Settings

#### OpenAI
```env
LLM_PROVIDER=openai
API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```
Models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4`, `gpt-3.5-turbo`

#### Anthropic Claude
```env
LLM_PROVIDER=anthropic
API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
```
Models: `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`, `claude-3-opus-20240229`

#### OpenRouter (Multiple Providers)
```env
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-your-key-here
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```
Access 100+ models through one API. [Get key](https://openrouter.ai/keys)

#### Ollama (Local LLM - Free & Private!)
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```
Run models locally. [Install Ollama](https://ollama.ai)

## 📡 API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "GRACE-X Brain API",
  "version": "2.0.0",
  "provider": "openai",
  "uptime": 3600
}
```

### GET /api/info
API information and available endpoints.

### GET /api/providers
List configured providers and available models.

### POST /api/brain
Main brain endpoint for AI responses.

**Request:**
```json
{
  "module": "builder",
  "messages": [
    { "role": "system", "content": "You are GRACE-X Builder..." },
    { "role": "user", "content": "How do I measure for a door?" }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

**Response:**
```json
{
  "reply": "To measure for a door, you'll need to...",
  "module": "builder",
  "provider": "openai",
  "requestId": "gx-abc123",
  "processingTime": 1234
}
```

## 🔒 Security

### Rate Limiting
- 30 requests per minute per IP (configurable)
- Returns `429` status with retry information

### Headers
- Helmet.js security headers
- CORS configuration
- Request size limits

### Best Practices
- Never commit `.env` to version control
- Use environment variables in production
- Enable HTTPS for production deployments
- Consider adding authentication for public deployments

## 🐛 Troubleshooting

### Error: API key not configured
- Ensure `.env` file exists and contains `API_KEY`
- Check the provider matches your key type

### Error: Rate limit exceeded
- Wait for the retry period
- Increase `RATE_LIMIT_MAX` if needed

### Ollama not connecting
- Ensure Ollama is running: `ollama serve`
- Check `OLLAMA_BASE_URL` is correct
- Pull a model first: `ollama pull llama3.2`

### CORS errors
- Check `CORS_ORIGINS` in `.env`
- Verify frontend URL is allowed

## 📊 Monitoring

Check server status:
```bash
# Health check
curl http://localhost:3000/health

# Provider info
curl http://localhost:3000/api/providers
```

## 🚢 Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager (PM2, systemd)
3. Set up reverse proxy (nginx)
4. Enable HTTPS
5. Restrict CORS origins
6. Add authentication layer

### PM2 Example
```bash
npm install -g pm2
pm2 start server.js --name gracex-brain
pm2 save
pm2 startup
```

### Docker (Coming Soon)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 📝 Changelog

### v2.0.0
- Added OpenRouter support (100+ models)
- Added Ollama support (local LLM)
- Enhanced security with Helmet.js
- Input validation and sanitization
- Request ID tracking
- Configurable rate limiting
- Structured logging
- Graceful shutdown
- Updated model names to latest versions

### v1.0.0
- Initial release
- OpenAI and Anthropic support
- Basic rate limiting
