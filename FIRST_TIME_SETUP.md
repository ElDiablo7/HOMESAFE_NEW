# 🚀 GRACE-X AI™ - FIRST TIME SETUP GUIDE
## Getting Your System Running in 5 Minutes

**© 2026 Zachary Charles Anthony Crockett**

---

## ⚡ QUICK START (For Those Who Know What They're Doing)

```bash
1. Get API key from https://console.anthropic.com/settings/keys
2. Edit server/.env - add your API key
3. Run START.bat (Windows) or ./START.sh (Linux/Mac)
4. Open http://localhost:8080
```

**Done!** If that worked, you're ready to use GRACE-X! 🎉

---

## 📋 DETAILED SETUP (Step-by-Step)

### **STEP 1: Check Prerequisites**

You need:
- ✅ **Node.js** installed (version 14 or higher)
- ✅ **Internet connection** (for API calls)
- ✅ **Anthropic API key** (free tier available)

**Check if you have Node.js:**
```bash
node --version
```

If you see a version number (like v18.0.0), you're good!

If not, download from: **https://nodejs.org/**

---

### **STEP 2: Get Your API Key**

1. Go to: **https://console.anthropic.com/settings/keys**
2. Sign up or log in (it's free!)
3. Click **"Create Key"**
4. Copy your new API key (starts with `sk-ant-`)

**Your key looks like this:**
```
sk-ant-api03-abc123xyz789...
```

**⚠️ KEEP THIS SECRET!** Don't share it or commit it to GitHub!

---

### **STEP 3: Configure Your System**

1. **Navigate to your GRACE-X folder**
   ```bash
   cd GRACE_X_BRAIN_COMPLETE_3RD_JAN
   ```

2. **Open the .env file**
   - **Windows:** `notepad server\.env`
   - **Mac/Linux:** `nano server/.env`
   - **Or:** Use any text editor

3. **Add your API key**
   
   Find this line:
   ```
   ANTHROPIC_API_KEY=sk-ant-YOUR-ACTUAL-KEY-HERE
   ```
   
   Replace with your real key:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-abc123xyz789...
   ```

4. **Also update the second line:**
   ```
   API_KEY=sk-ant-api03-abc123xyz789...
   ```

5. **Save the file** (Ctrl+S in Notepad, Ctrl+X then Y in nano)

**Your .env should look like this:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-REAL-KEY-HERE
API_KEY=sk-ant-api03-YOUR-REAL-KEY-HERE
LLM_PROVIDER=anthropic
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

---

### **STEP 4: Start the System**

#### **Windows:**
1. Double-click **`START.bat`**
2. Wait for "Server ready" message
3. Browser will open automatically

#### **Mac/Linux:**
1. Open Terminal
2. Navigate to GRACE-X folder
3. Run: `chmod +x START.sh` (first time only)
4. Run: `./START.sh`

**You should see:**
```
╔═══════════════════════════════════════════════════════════╗
║   🚀  GRACE-X Brain API Server v2.0.0                     ║
║   📡  Server:    http://localhost:3000                    ║
║   🔑  Provider:  anthropic                                ║
║   🔒  API Key:   ✓ Configured                            ║
╚═══════════════════════════════════════════════════════════╝
```

**If you see "✗ NOT SET"** - go back to Step 3!

---

### **STEP 5: Test Your Connection**

Open in your browser:
```
http://localhost:8080/CONNECTION_TEST.html
```

This will run 4 tests:
1. ✅ Backend Server (Port 3000)
2. ✅ Health Check Endpoint
3. ✅ API Key Configuration
4. ✅ Brain API Test Message

**All tests should pass!** If not, the test page will tell you exactly what to fix.

---

### **STEP 6: Open GRACE-X**

Once all tests pass, open:
```
http://localhost:8080
```

You should see the GRACE-X boot screen, then the main interface!

**Try it:**
- Click **"GRACE-X Core™"** module
- Type a message in the chat
- Press Enter
- Watch GRACE respond!

---

## 🐛 TROUBLESHOOTING

### **Problem: "Cannot connect to backend server"**

**Solution:**
1. Make sure START.bat is running (don't close the window)
2. Check if port 3000 is in use:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3000
   ```
3. If something is using port 3000, kill it or change the PORT in .env

---

### **Problem: "API key not configured"**

**Solution:**
1. Open `server/.env`
2. Make sure your API key is there
3. Make sure it starts with `sk-ant-`
4. **Restart the server** (close START.bat and run it again)

---

### **Problem: "Brain API test failed"**

**Possible causes:**
- **API key invalid:** Check it's the right format
- **No internet:** Check your connection
- **Rate limit:** Wait a minute and try again
- **Wrong provider:** Make sure `LLM_PROVIDER=anthropic` in .env

**Solution:**
1. Verify API key is correct
2. Check internet connection
3. Look at server console for detailed error messages
4. Try copying your API key again (no extra spaces!)

---

### **Problem: "Module won't load" or "Nothing happens"**

**Solution:**
1. Open browser console (F12)
2. Look for errors in red
3. Most common: CORS error or API endpoint wrong
4. Make sure index.html line 141 says:
   ```javascript
   window.GRACEX_BRAIN_API = 'http://localhost:3000/api/brain';
   ```

---

### **Problem: Server starts but crashes immediately**

**Solution:**
1. Check Node.js is installed: `node --version`
2. Install dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```
3. Check for errors in server console
4. Make sure .env file is valid (no typos)

---

## 📁 FILE STRUCTURE

```
GRACE_X_BRAIN_COMPLETE_3RD_JAN/
│
├── index.html              ← Main entry point
├── START.bat              ← Windows launcher
├── START.sh               ← Linux/Mac launcher
├── CONNECTION_TEST.html   ← Connection test page
│
├── server/
│   ├── .env              ← YOUR API KEY GOES HERE! ⭐
│   ├── server.js         ← Backend server
│   └── package.json      ← Dependencies
│
├── assets/
│   ├── css/              ← Stylesheets
│   ├── js/               ← JavaScript
│   ├── img/              ← Images
│   └── audio/            ← Voice files
│
└── modules/              ← Module HTML files
    ├── core.html
    ├── sport.html
    └── ...
```

---

## 🔧 ADVANCED CONFIGURATION

### **Change Ports**

Edit `server/.env`:
```env
PORT=3000          # Change backend port
```

Edit `START.bat` (line 69):
```batch
npx -y http-server -p 8080    # Change frontend port
```

Also update `index.html` (line 141):
```javascript
window.GRACEX_BRAIN_API = 'http://localhost:YOUR_PORT/api/brain';
```

---

### **Use Different AI Model**

Edit `server/.env`:
```env
LLM_PROVIDER=anthropic          # Options: anthropic, openai, openrouter, ollama
ANTHROPIC_MODEL=claude-sonnet-4-20250514   # Specific model
```

---

### **Production Deployment**

For production servers:
```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

---

## 🎯 WHAT TO DO NEXT

1. **Explore Modules:**
   - Try GRACE-X Sport™ for sports betting
   - Try GRACE-X Builder™ for construction tools
   - Try GRACE-X Uplift™ for mental wellness

2. **Customize:**
   - Edit module content in `modules/` folder
   - Modify styles in `assets/css/`
   - Add your own features!

3. **Test Features:**
   - Voice input (🎙️ button)
   - Theme switching (🎨 button)
   - Sidebar collapse
   - Module navigation

---

## 📞 NEED HELP?

### **Common Questions:**

**Q: Is this free?**
A: Yes! The software is free. You need an Anthropic API key (free tier available).

**Q: Do I need to be online?**
A: Yes, for AI features. The interface works offline but can't process AI requests.

**Q: Can I use this commercially?**
A: This is prototype software. Check licensing terms before commercial use.

**Q: Where's my API key stored?**
A: In `server/.env` - it never leaves your machine!

---

## ✅ SUCCESS CHECKLIST

Before using GRACE-X, make sure:

- [ ] Node.js is installed
- [ ] API key is in `server/.env`
- [ ] START.bat is running
- [ ] All 4 connection tests pass
- [ ] Browser opens to http://localhost:8080
- [ ] Can send a message and get AI response

**All checked?** You're ready! 🚀

---

## 🎉 YOU'RE READY!

Your GRACE-X AI™ system is configured and running!

**Next steps:**
1. Open http://localhost:8080
2. Click any module
3. Start exploring!

**Tips:**
- Use voice input for hands-free operation
- Try different modules to see all features
- Check out CORE 2.0™ for the advanced AI interface
- Export your conversations for safekeeping

**Enjoy your GRACE-X AI™ experience!**

---

**© 2026 Zachary Charles Anthony Crockett**
**GRACE-X AI™ - FOR THE PEOPLE - ALWAYS ❤️**
