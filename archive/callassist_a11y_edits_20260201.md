# CallAssist Speech Helper – Edit Summary (1 Feb 2026)

**Backup location:** `archive/callassist_backup_20260201/`  
**Scope:** CallAssist module only – speech helper for blind & disabled users. No drift.

---

## Files Changed

### 1. NEW: `public/callassist/callassist-speech-helper.js`

- **Accessibility mode** – Toggle stored in `localStorage` (`ca_a11y_mode`)
- **Functions:**
  - `isEnabled()` / `setEnabled(on)` – Read/write accessibility mode
  - `speak(text, options)` – TTS via Web Speech API (en-GB, rate 0.9)
  - `announceToLiveRegion(message)` – Updates ARIA live region
  - `onA11yMessage(text)` – Called when GRACE replies; speaks if a11y on
- **On load (a11y on):** Speaks page title, heading, and nav labels
- **Focus announcements:** Speaks label of focused elements (buttons, links, inputs)
- **Live region:** Hidden `#ca-a11y-live` for screen reader announcements
- **Exposed API:** `window.CallAssistA11y`

---

### 2. UPDATED: `public/callassist/prep.html`

| Change | Details |
|--------|---------|
| Nav | `role="navigation"`, `aria-label="CallAssist pages"`, `aria-current="page"` on active link, `aria-label` on each link |
| A11y toggle | New button `#ca-a11y-toggle` "♿ Accessibility off/on" with `role="switch"`, `aria-pressed` |
| Voice toggle | `aria-pressed`, `aria-label` |
| Buttons | `aria-label` on Take photo, Choose file, Read & draft reply, Clear, Save, Ask, Clear conversation |
| Inputs | `aria-label` on call brief textarea, brain input |
| Brain output | `role="log"`, `aria-live="polite"`, `aria-label="GRACE assistant replies"` |
| Script | Added `callassist-speech-helper.js` before `callassist.js` |

---

### 3. UPDATED: `public/callassist/on-call.html`

- Same ARIA and toggle changes as prep.html
- `aria-label` on notes textarea, Save notes, brain input, Clear conversation

---

### 4. UPDATED: `public/callassist/wrap.html`

- Same ARIA and toggle changes as prep.html
- `aria-label` on wrap notes textarea, Save, brain input, Clear conversation

---

### 5. UPDATED: `public/callassist/callassist.js`

- **TTS logic:** When appending AI message, if `CallAssistA11y.isEnabled()` → call `onA11yMessage(text)`; else if `voiceOn` → existing TTS
- **Letter scanner:** After vision API reply, if a11y on → call `onA11yMessage(reply)`

---

### 6. UPDATED: `public/callassist/callassist.css`

- **`.sr-only`** – Visually hidden, screen-reader-visible content
- **`:focus-visible`** – Clear focus outline for buttons, links, inputs, selects
- **`@media (prefers-reduced-motion: reduce)`** – Disables animations and transitions

---

## How to Use (Blind/Disabled Users)

1. Open CallAssist (Prep, On-Call, or Wrap)
2. Tab to **♿ Accessibility off** and activate (Enter/Space)
3. Page announces title, heading, and nav
4. When tabbing, focused elements are spoken
5. GRACE replies are spoken automatically when accessibility mode is on

---

## Backup

Full CallAssist folder copied to: `archive/callassist_backup_20260201/`
