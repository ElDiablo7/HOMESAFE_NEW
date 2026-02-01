# Voice Assistant — Quick Reference v6.4.1

## 🎙️ What Changed

### OLD Behavior (v6.4.0)
- Voice stopped after **~1 second** of silence
- Often cut off mid-sentence
- Frustrating for longer queries

### NEW Behavior (v6.4.1)
- Voice continues for **2.5 seconds** after you stop speaking
- Automatically submits when silence detected
- Click mic button anytime to manually stop
- Perfect for natural speech flow

---

## 📱 How to Use (P11 Tablet)

### Starting Voice Input:
1. Click **🎙️ microphone button**
2. Wait for **🔴 red indicator** and "Listening..." text
3. Speak your query naturally
4. Mic now shows: "Listening... (click mic to stop)"

### Stopping Voice Input:

**Option 1: Auto-Stop (Recommended)**
- Just stop talking
- Wait 2.5 seconds
- System auto-submits your transcript

**Option 2: Manual Stop**
- Click **🔴 microphone button** while listening
- Your transcript is captured but NOT auto-submitted
- Click Send button to submit

---

## 💡 Examples

### Short Query (Works Like Before):
```
You: "What's the weather?"
[2.5s silence]
→ Auto-submits ✅
```

### Long Query (Now Works Better):
```
You: "Search for John Smith..."
[pause to think]
"...who works in Cardiff..."
[pause again]
"...and may have accounts on LinkedIn and Twitter"
[2.5s silence]
→ Auto-submits with full query ✅
```

### Multi-Sentence (Previously Impossible):
```
You: "I need help with Builder. 
Can you generate a scope for a kitchen renovation?
Include electrical and plumbing work."
[2.5s silence]
→ Captures everything ✅
```

---

## ⚙️ Technical Details

### Silence Timer:
- **Duration:** 2500ms (2.5 seconds)
- **Trigger:** Starts after last detected word
- **Reset:** Resets if you start speaking again
- **Action:** Auto-submits transcript when timer completes

### Browser Compatibility:
- ✅ Chrome (recommended)
- ✅ Edge
- ⚠️ Firefox (limited support)
- ❌ Safari (no support)

### Privacy:
- All voice processing happens in your browser
- Transcripts sent to AI provider (Anthropic)
- No voice recordings stored

---

## 🔧 Troubleshooting

### Voice Cuts Off Too Soon:
**Unlikely now** — 2.5s should be plenty. If still happening:
- Check browser permissions
- Ensure microphone is working
- Try manual stop (click mic button)

### Voice Doesn't Auto-Submit:
- Make sure you have a complete transcript
- Wait full 2.5 seconds of silence
- Check for "Listening..." message
- Try manual stop and click Send

### Mic Button Not Working:
- Refresh page
- Check browser console for errors
- Verify browser supports Web Speech API
- Try different browser (Chrome recommended)

---

## 📊 Comparison

| Feature | v6.4.0 (Old) | v6.4.1 (New) |
|---------|--------------|--------------|
| **Silence Timeout** | ~1 second | 2.5 seconds |
| **Continuous** | ❌ No | ✅ Yes |
| **Auto-Submit** | ✅ Yes | ✅ Yes |
| **Manual Stop** | ✅ Yes | ✅ Yes |
| **Multi-Sentence** | ❌ Poor | ✅ Excellent |
| **Natural Speech** | ⚠️ Rushed | ✅ Comfortable |

---

## 🎯 Best Practices

### For Best Results:
1. **Speak naturally** — no need to rush
2. **Pause briefly** between thoughts (under 2.5s)
3. **Wait 2.5s** when completely done
4. **Manual stop** if unsure (safer than auto-submit)

### Module-Specific Tips:

**OSINT Investigations:**
- Longer queries now work perfectly
- Example: "Search for [person] on Facebook, Twitter, and LinkedIn in Cardiff area"

**Builder Scopes:**
- Describe full room in one go
- Example: "Kitchen, 4 meters by 3 meters, new wiring, new plumbing, tiled floor"

**Uplift Support:**
- Take your time, no rush
- System won't cut you off mid-sentence
- Speak as naturally as you would to a person

---

## 🔄 Reverting Changes

If you prefer the old behavior:

**Edit:** `assets/js/brainV5Helper.js`  
**Line 337:** Change to:
```javascript
recognition.continuous = false;  // Old behavior
```

**Line 333:** Remove or comment out:
```javascript
// const SILENCE_DURATION = 2500;
```

---

**Updated:** December 25, 2025  
**Version:** 6.4.1  
**Status:** Production Ready ✅
