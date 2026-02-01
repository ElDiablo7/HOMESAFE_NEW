# GRACE-X Audit + Patch Report
Date: 2025-12-21 12:58 UTC
Build Label (patched): ZGV6_19.12.25.8_ANCHOR_VOICE_AUDIT

## What you told me
- Forge/Core buttons intermittently not responding.
- “Hundreds” of errors showing in the overlay.
- Mic cuts you off too early; you want ~15s listening before it even thinks about stopping.

## What I checked (static audit)
- JS syntax check (Node `--check`) on core JS files: **PASS**
- Verified `index.html` referenced assets exist: **PASS**
- Reviewed error overlay wiring in `assets/js/core.js`.

## Fixes applied in this patch
### 1) Mic/Voice: stop cutting you off
File: `assets/js/core.js` (both Core voice initialisers)

- **Silence window increased to 15s** (pause-friendly).
- **Removed the old “auto stop after 15 seconds” behavior** that could chop you mid-sentence.
- Added:
  - `MIN_LISTEN_MS = 15000` (minimum listening window before any auto-stop is allowed)
  - `MAX_SESSION_MS = 30000` (hard safety cap so it can’t listen forever if the browser gets weird)

Result: you can talk naturally; short pauses won’t end the capture.

### 2) Error Overlay: prevent spam storms
File: `assets/js/core.js`

- Added **dedupe + throttle** in the global error handler:
  - same error only renders overlay up to 3 times (still logged internally)
  - minimum 250ms between overlay renders
- Filtered a common non-actionable browser spam case:
  - `ResizeObserver loop limit exceeded`

Result: you’ll still see *real* errors, but it won’t drown you in repeats.

### 3) Build label consistency
File: `assets/js/core.js`

- Updated `BUILD_ID` so the overlay reflects the patched anchor label.

## What I did NOT change (on purpose)
- No refactors.
- No CSS/theme changes.
- No sports logic changes.
This was a **stability pass**, not a feature pass.

## What to test (5-minute smoke test)
1. Start server (your normal `START_GRACEX.bat`)
2. Open Core → click **Mic**
3. Speak for ~10–20 seconds with a couple pauses
4. Confirm it does **not** cut you off early
5. Open Forge → click around:
   - Console button
   - Laser toggle
   - Any “Generate output” / action buttons
6. If an error happens:
   - confirm overlay appears **once**, not 100 times

## If you still get “hundreds of errors”
That usually means one of these:
- a repeating timer calling a failing function (e.g., fetch loop)
- an API call failing every tick (401/403/404)
- browser permission issues (mic blocked) triggering error loops

If it happens again, copy **the first 3 unique errors** from the overlay and paste them—don’t paste 200 lines.
