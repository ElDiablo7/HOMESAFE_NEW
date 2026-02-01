# GRACE-X Quick Start Guide

## 🚀 Getting Started

### 1. Start Frontend Server

```bash
# In project root directory
python -m http.server 8000
```

Then open: http://localhost:8000

### 2. (Optional) Enable Level 5 API

See `SETUP_LEVEL5_API.md` for full instructions.

**Quick version:**
```bash
cd server
npm install
# Edit .env and add your API key
npm start
```

Then uncomment API config in `index.html`.

### 3. Run Automated Tests

**Option A: Browser Console**
1. Open GRACE-X in browser
2. Press F12 to open console
3. Run: `GRACEX_RUN_TESTS()`

**Option B: Auto-run**
Add `?test=true` to URL: http://localhost:8000?test=true

**Option C: Include in HTML**
Uncomment test script in `index.html`:
```html
<script src="test/test-suite.js"></script>
```

## 📁 Project Structure

```
├── index.html              # Main entry point
├── assets/
│   ├── js/                # JavaScript modules
│   ├── css/               # Stylesheets
│   ├── audio/             # Audio files
│   └── img/               # Images
├── modules/               # Module HTML files
├── server/                # Level 5 API backend
│   ├── server.js          # Express server
│   ├── package.json       # Dependencies
│   └── .env               # API configuration (create this)
└── test/                  # Test suite
    └── test-suite.js      # Automated tests
```

## 🧪 Testing

### Manual Testing
Use `TESTING_CHECKLIST.md` for comprehensive manual testing.

### Automated Testing
Run `test/test-suite.js` - see `test/README.md` for details.

## 🔧 Configuration

### Level 5 API (Optional)
- Backend: `server/` directory
- Frontend: Uncomment API config in `index.html`
- See: `SETUP_LEVEL5_API.md`

### TTS Settings
Edit `assets/js/voiceTTS.js` to adjust voice settings.

### System Prompts
Edit `assets/js/brainLevel5.js` to customize module personalities.

## 📚 Documentation

- `README.md` - Project overview
- `SETUP_LEVEL5_API.md` - API setup guide
- `BRAIN_LEVEL5_SETUP.md` - Detailed brain system docs
- `TESTING_CHECKLIST.md` - Manual testing guide
- `test/README.md` - Automated test docs
- `server/README.md` - Backend API docs

## 🐛 Troubleshooting

### Module not loading
- Check browser console for errors
- Verify module HTML file exists in `modules/`
- Check router is working (see `assets/js/router.js`)

### TTS not working
- Check browser supports SpeechSynthesis API
- Verify `voiceTTS.js` is loaded
- Check browser console for errors

### Level 5 not working
- Verify backend server is running
- Check API endpoint in `index.html`
- Verify API key in `server/.env`
- Check browser console for API errors

### Tests failing
- Check browser console for details
- Verify all required files are accessible
- Check that server is running (for API tests)

## ✅ Status

- ✅ All 14 modules upgraded to V5
- ✅ TTS integrated
- ✅ Voice panels working
- ✅ Level 5 brain system ready
- ✅ Automated test suite available
- ⏳ Level 5 API backend (optional setup)

## 🎯 Next Steps

1. **Test all modules** - Use `TESTING_CHECKLIST.md`
2. **Set up Level 5 API** - See `SETUP_LEVEL5_API.md`
3. **Run automated tests** - See `test/README.md`
4. **Fine-tune system prompts** - Edit `brainLevel5.js`
5. **Customize TTS** - Edit `voiceTTS.js`
