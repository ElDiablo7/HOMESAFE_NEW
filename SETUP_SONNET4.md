# ⚡ QUICK SETUP - ANTHROPIC SONNET 4

Your GRACE-X system is configured to use Claude Sonnet 4!

## 🔑 Final Step: Add Your API Key

**1. Open this file:**
```
server/.env
```

**2. Find this line:**
```
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY_HERE
```

**3. Replace with your actual key:**
```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_ACTUAL_KEY_HERE
```

**4. Save and close**

**5. Start GRACE-X:**
- Windows: Double-click `START.bat`
- Linux/Mac: Run `./START.sh`

---

## ✅ Current Configuration

```
✅ Provider: Anthropic (Claude)
✅ Model: claude-sonnet-4-20250514 (LATEST!)
✅ Fallback: OpenAI (gpt-4o-mini)
✅ Voice: 2.5s dynamic listening
✅ Boot: One-click launcher
```

---

## 🔍 Verify It's Working

After starting, open browser to:
```
http://localhost:3000/health
```

Should show:
```json
{
  "status": "ok",
  "provider": "anthropic",
  ...
}
```

---

## 💡 Pro Tip

Keep both API keys in .env:
- Anthropic for best quality (Sonnet 4)
- OpenAI as automatic fallback if Anthropic rate limits

---

**You're all set!** 🚀

Just add your Anthropic API key to server/.env and run START.bat
