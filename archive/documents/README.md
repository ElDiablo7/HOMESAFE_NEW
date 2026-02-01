# GRACEX_ANCHORED_WORKFLOW_BUILD
Build date: 2025-11-13

Ready-to-run anchored build with:
- Boot overlay that clears on first gesture (also triggers boot audio)
- Bottom taskbar + ordered sidebar
- Hash router loading `/modules/{id}.html`
- Audio Manager (boot, clicks, uplift-enter) with persistent settings panel
- OSINT locked screen

Quick start
1) Unzip to a folder.
2) Run a local server (not file://):
   - `python -m http.server 8000`  -> http://localhost:8000
   - or `npx serve .`
3) Drop your audio files into `assets/audio/` and adjust `config/audio.json` if needed.
4) Replace placeholders in `/modules/*.html` with your real UIs.

Paths
- index.html
- assets/css/core.css
- assets/js/app.js, router.js, audioManager.js
- assets/audio/*.mp3 (you add these)
- assets/img/logo.svg
- config/audio.json
- modules/*.html

(c) 2025-11-13 GRACE-X AI™ — Anchored Workflow Build
