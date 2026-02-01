# GRACE-X Enhanced Voice Settings Guide

**Date:** 2025-12-18  
**Status:** ✅ Enhanced TTS v3.0 Complete

---

## 🎙️ What's New in v3.0

### 🔒 Voice Lock Feature (NEW!)
**Your voice settings now PERSIST!** The voice no longer resets when switching modules.

- **Lock My Voice** - checkbox in settings panel
- **Auto-lock on Save** - clicking "Save & Lock" prevents module overrides
- Settings survive page refresh and module navigation

### Better Voice Quality
- **Slower default speed** (0.90x) for clearer speech
- **Mid-low pitch** (0.95) for natural UK female voice
- **Softer volume** (0.88) to reduce harshness
- **Smart voice selection** - automatically picks best quality female UK voice

### Voice Presets (Character-Compliant)
Choose from module-specific voice tones:
1. **GRACE Canonical** (Default) - Calm, grounded UK voice
2. **Uplift/Crisis** - Slow, steady, safety-focused
3. **Family** - Softer, protective, age-aware
4. **Professional** - Clear, technical when needed
5. **Yoga/Meditation** - Extra slow, calming
6. **Clear/Accessibility** - Maximum clarity mode

### UI Control Panel
- Visual sliders for speed, pitch, volume
- Voice selection dropdown
- **Lock My Voice** toggle
- Preview button to test settings
- Save & Lock functionality

---

## 🎨 How to Use

### Open Voice Settings

**Option 1:** Click the 🎙️ button (bottom-right of screen)

**Option 2:** Run in console:
```javascript
GRACEX_TTS.showSettings()
```

### Quick Presets

Try different personalities:
```javascript
GRACEX_TTS.applyPreset('natural');    // Recommended
GRACEX_TTS.applyPreset('clear');      // Slow & clear
GRACEX_TTS.applyPreset('warm');       // Warm & friendly
GRACEX_TTS.applyPreset('professional');
GRACEX_TTS.applyPreset('energetic');
```

### Fine-Tune Settings

```javascript
// Adjust individual settings
GRACEX_TTS.updateSettings({
  rate: 0.9,     // Speed (0.1 to 10, default: 0.95)
  pitch: 1.2,    // Pitch (0 to 2, default: 1.1)
  volume: 0.8    // Volume (0 to 1, default: 0.9)
});

// Preview your settings
GRACEX_TTS.preview();

// Or preview with custom text
GRACEX_TTS.preview('Hello, testing voice settings.');
```

### Enable/Disable Voice

```javascript
GRACEX_TTS.enable();   // Turn on
GRACEX_TTS.disable();  // Turn off
GRACEX_TTS.toggle();   // Switch state
```

### Select Specific Voice

```javascript
// Get available voices
const voices = GRACEX_TTS.getVoices();
console.log(voices);

// Set specific voice
GRACEX_TTS.updateSettings({
  voice: voices[0]  // Use first voice in list
});
```

---

## 🎯 Recommended Settings by Use Case

### For Clarity (Learning/Instructions)
```javascript
GRACEX_TTS.updateSettings({
  rate: 0.85,    // Slower
  pitch: 1.0,    // Neutral
  volume: 1.0    // Full volume
});
```

### For Comfort (Long Sessions)
```javascript
GRACEX_TTS.updateSettings({
  rate: 0.9,     // Slightly slow
  pitch: 1.1,    // Slightly high
  volume: 0.8    // Quieter
});
```

### For Natural Conversation
```javascript
GRACEX_TTS.updateSettings({
  rate: 0.95,    // Near normal
  pitch: 1.1,    // Slightly feminine
  volume: 0.9    // Slightly soft
});
```

### For Urgency/Alerts
```javascript
GRACEX_TTS.updateSettings({
  rate: 1.1,     // Faster
  pitch: 1.15,   // Higher
  volume: 0.95   // Louder
});
```

---

## 🔧 Technical Details

### Voice Selection Priority

The system automatically selects voices in this order:

1. **High-quality UK female** (Microsoft Hazel, Google UK Female, etc.)
2. **Any UK female voice**
3. **High-quality US female** (Microsoft Zira, Google US Female, etc.)
4. **Any UK English voice**
5. **Any English voice**
6. **Default system voice**

### Text Cleaning

The TTS system automatically cleans text for better speech:
- Removes markdown formatting (`**bold**`, `*italic*`, `` `code` ``)
- Converts newlines to pauses
- Trims whitespace

### Settings Persistence

Your settings are automatically saved to localStorage and restored on page reload.

---

## 📱 Available Voices by Platform

### Windows
- **Microsoft Hazel Desktop** (UK, Female) - ⭐ Recommended
- **Microsoft Zira Desktop** (US, Female)
- **Microsoft David Desktop** (US, Male)

### Mac OS
- **Samantha** (US, Female) - ⭐ High quality
- **Karen** (AU, Female)
- **Daniel** (UK, Male)
- **Serena** (UK, Female)

### Chrome (All Platforms)
- **Google UK English Female** - ⭐ Good quality
- **Google US English Female**
- **Google UK English Male**

### Mobile (iOS/Android)
- Various system voices depending on device
- Quality varies by platform

---

## 🎵 Tips for Best Experience

### 1. Use Headphones/Speakers
Built-in laptop speakers can make any voice sound harsh. External audio improves quality significantly.

### 2. Try Different Voices
Click through the voice dropdown and preview each one. Some voices sound dramatically better than others.

### 3. Slower is Clearer
If GRACE-X is hard to understand, reduce speed to 0.8-0.85x.

### 4. Adjust Pitch for Comfort
- Too robotic? Increase pitch to 1.2-1.3
- Too shrill? Decrease pitch to 0.9-1.0

### 5. Volume Balance
Match GRACE-X volume to your other audio sources for comfortable listening.

### 6. Save & Lock Your Favorites
Once you find settings you like, click **"Save & Lock"** in the settings panel. This prevents modules from changing your voice!

### 7. Lock Your Voice (Prevent Resets)
If your voice keeps going back to default:
```javascript
// Lock current settings
GRACEX_TTS.lockSettings();

// Or unlock to allow module-specific voices
GRACEX_TTS.unlockSettings();

// Check if locked
console.log(GRACEX_TTS.isSettingsLocked());
```

---

## 🐛 Troubleshooting

### Voice Sounds Robotic

**Solution:**
1. Increase pitch to 1.2-1.3
2. Decrease speed to 0.85-0.9
3. Try different voices in dropdown
4. Use "Warm & Friendly" preset

### Voice is Too Fast

**Solution:**
```javascript
GRACEX_TTS.updateSettings({ rate: 0.85 });
```

### Voice is Too Quiet

**Solution:**
```javascript
GRACEX_TTS.updateSettings({ volume: 1.0 });
```

### No Voices Available

**Solution:**
- Refresh the page
- Check browser supports Web Speech API
- On Windows: Install speech synthesis voices from Settings
- On Mac: Check System Preferences > Accessibility > Speech

### Voice Keeps Cutting Out

**Solution:**
- Disable browser extensions that might interfere
- Check system volume isn't muted
- Try different browser (Chrome has best support)

### Voice Keeps Resetting to Default

**Solution:**
1. Open voice settings: `GRACEX_TTS.showSettings()`
2. Adjust your preferred voice/speed/pitch
3. Check the **"🔒 Lock My Voice"** checkbox
4. Click **"Save & Lock"**

Or via console:
```javascript
GRACEX_TTS.lockSettings();
GRACEX_TTS.saveSettings();
```

This prevents module navigation from overriding your voice!

---

## 🎨 Console Commands

```javascript
// Show all available commands
Object.keys(GRACEX_TTS);

// List all voices with details
GRACEX_TTS.getVoices().forEach((v, i) => {
  console.log(`${i}: ${v.name} (${v.lang}) ${v.localService ? '✓' : ''}`);
});

// Get current settings
console.log(GRACEX_TTS.getSettings());

// Get all presets
console.log(GRACEX_TTS.getPresets());

// Check if voice is enabled
console.log(GRACEX_TTS.isEnabled());

// Check if currently speaking
console.log(GRACEX_TTS.isSpeaking());
```

---

## 📖 API Reference

### Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `speak(text, options)` | text, optional settings | Speak text with settings |
| `stop()` | none | Stop current speech |
| `enable()` | none | Enable TTS |
| `disable()` | none | Disable TTS |
| `toggle()` | none | Toggle TTS on/off |
| `updateSettings(settings)` | settings object | Update voice settings |
| `applyPreset(name)` | preset name | Apply voice preset |
| `getSettings()` | none | Get current settings |
| `getPresets()` | none | Get available presets |
| `getVoices()` | none | Get available voices |
| `preview(text)` | optional text | Preview voice |
| `showSettings()` | none | Show settings panel |
| `hideSettings()` | none | Hide settings panel |
| `isEnabled()` | none | Check if enabled |
| `isSpeaking()` | none | Check if speaking |
| `isSupported()` | none | Check browser support |

### Settings Object

```javascript
{
  rate: 0.95,      // Speed (0.1 to 10)
  pitch: 1.1,      // Pitch (0 to 2)
  volume: 0.9,     // Volume (0 to 1)
  lang: 'en-GB',   // Language code
  voice: null      // Voice object or null
}
```

---

## 🌟 Examples

### Module-Specific Voice Personalities

```javascript
// Uplift module - calm, slower
GRACEX_TTS.updateSettings({
  rate: 0.85,
  pitch: 1.0,
  volume: 0.8
});

// Chef module - energetic
GRACEX_TTS.updateSettings({
  rate: 1.0,
  pitch: 1.15,
  volume: 0.9
});

// Builder module - clear, professional
GRACEX_TTS.updateSettings({
  rate: 0.9,
  pitch: 1.0,
  volume: 0.95
});
```

### Animated Settings Changes

```javascript
// Gradually speed up
for (let r = 0.9; r <= 1.2; r += 0.1) {
  setTimeout(() => {
    GRACEX_TTS.updateSettings({ rate: r });
    GRACEX_TTS.preview(`Speed ${r.toFixed(1)}`);
  }, (r - 0.9) * 2000);
}
```

---

## ✅ Summary

**What Changed:**
- 🎙️ Default voice is now 0.95x speed (was 1.0x)
- 🎨 Default pitch is now 1.1 (was 1.0) - more feminine
- 🔊 Default volume is now 0.9 (was 1.0) - less harsh
- ✨ 5 voice presets added
- 🎛️ Visual settings panel with sliders
- 💾 Settings persist across sessions
- 🔍 Smarter voice selection (prioritizes quality)
- 🎵 Preview function to test settings

**How to Access:**
1. Click 🎙️ button (bottom-right)
2. Or run `GRACEX_TTS.showSettings()`

**Quick Fix:**
```javascript
// If voice still sounds robotic
GRACEX_TTS.applyPreset('warm');
GRACEX_TTS.preview();
```

---

**Ready to sound more human!** 🎉
