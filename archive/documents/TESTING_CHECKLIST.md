# GRACE-X Testing Checklist
**Date:** 2025-12-03  
**Status:** Smoke Test ✅ Passed

## Pre-Testing Setup
- [x] Smoke test passed (boot, no console errors, module switching works)
- [ ] Local server running (`python -m http.server 8000`)
- [ ] Browser console open for error checking
- [ ] Audio enabled and working

---

## Core Module Testing
- [ ] Boot sequence plays correctly
- [ ] Boot video loads and plays
- [ ] Boot audio plays
- [ ] Can skip boot with click/keypress
- [ ] Core module loads correctly
- [ ] Core chat input works
- [ ] Core chat responses appear
- [ ] Core chat TTS speaks responses
- [ ] Core voice panel microphone works
- [ ] Core voice panel TTS speaks responses
- [ ] Debug panel shows last heard/reply/intent
- [ ] No console errors

---

## Module Testing (All 14 Modules)

### 1. Builder
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds (Level 1 or Level 5)
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 2. SiteOps
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 3. TradeLink
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 4. Beauty
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 5. Fit
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 6. Yoga
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 7. Uplift
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 8. Chef
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 9. Artist
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 10. Family
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 11. Gamer
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 12. Accounting
- [ ] Module loads correctly
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

### 13. OSINT
- [ ] Module loads correctly
- [ ] Locked screen appears (if locked)
- [ ] Brain panel initializes
- [ ] Can type in brain panel
- [ ] Brain panel responds
- [ ] Brain panel TTS speaks responses
- [ ] Clear conversation button works
- [ ] Voice panel microphone works
- [ ] Voice panel TTS speaks responses
- [ ] No console errors

---

## Cross-Module Testing
- [ ] Can switch between all modules smoothly
- [ ] Module state persists when switching
- [ ] No memory leaks when switching modules
- [ ] TTS stops when switching modules
- [ ] Audio doesn't overlap between modules

---

## TTS System Testing
- [ ] TTS speaks in all modules
- [ ] TTS voice is clear and understandable
- [ ] TTS can be stopped (if stop function exists)
- [ ] Multiple rapid responses handled correctly
- [ ] TTS doesn't block UI
- [ ] TTS works in different browsers (Chrome, Firefox, Safari)

---

## Level 5 Brain Testing (If API Configured)
- [ ] API endpoint configured
- [ ] Level 5 responses work (not Level 1 fallback)
- [ ] Conversation memory works (remembers context)
- [ ] Module-specific system prompts work
- [ ] Fallback to Level 1 works when API unavailable
- [ ] Error handling works for API failures

---

## Performance Testing
- [ ] Page loads quickly
- [ ] Module switching is smooth
- [ ] No lag when typing in brain panels
- [ ] TTS doesn't cause performance issues
- [ ] Memory usage is reasonable

---

## Browser Compatibility
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (if applicable)

---

## Notes
_Add any issues or observations here:_

---

## Next Steps After Testing
1. Fix any bugs found during testing
2. Set up Level 5 API backend (if desired)
3. Fine-tune system prompts
4. Adjust TTS settings if needed
5. Create user documentation
