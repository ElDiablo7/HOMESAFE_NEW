GRACE-X AI™ – Prototype 22.11.25

This folder contains the working GRACE-X AI front-end prototype as of 22.11.25.

Core structure
--------------
- index.html – main entry point and layout shell (boot overlay, sidebar, content area)
- assets/css/core.css, builder.css – core styling for shell and cards
- assets/js/core.js – boot overlay, navigation, module loading, and intro voice hooks
- assets/js/app.js, router.js – additional wiring and helpers
- assets/js/* – per-module behaviours (builder, siteops, tradelink, uplift, gamer, family, artist, chef, fit, accounting, osint)
- modules/*.html – individual module views that load into the main content area
- assets/audio/boot_voice.mp3 – legacy boot audio
- assets/audio/VOICES_HERO/*.mp3 – current hero voice lines for boot and module intros
- config/audio.json – reserved for future audio configuration

Audio behaviour
---------------
- Boot:
  - On first click or key press, core.js plays assets/audio/VOICES_HERO/core_boot.mp3
  - The old assets/audio/boot_voice.mp3 file is kept as a fallback asset but is not the main boot line.

- Module intros (handled by assets/js/audioManager.js and core.js):
  - Builder      → assets/audio/VOICES_HERO/builder_intro.mp3
  - SiteOps      → assets/audio/VOICES_HERO/siteops_intro.mp3
  - TradeLink    → assets/audio/VOICES_HERO/tradelink_intro.mp3
  - Uplift       → assets/audio/VOICES_HERO/uplift_intro.mp3

Modules – current status
------------------------
Fully implemented / interactive mini-tools in this prototype:

- Core: GRACE-X overview and brand landing card.
- Builder: Builder helper (scaffolding / planning tools as per previous stable builds).
- SiteOps: Site / rigging helper module.
- TradeLink: Trades / job helper module.
- Uplift: Wellbeing / grounding prototype.
- Gamer: GRACE-X Gamer Mode helper.
- Family: Family Hub – daily plan, tasks/chores, shout-outs.
- Chef: Fakeaway planner – craving helper, simple shopping list, cost & savings estimator.
- Fit: Fit helper – daily check-in, water and movement counters, weekly focus notes.
- Artist: Prompt and shot-list helper for creative assets.
- Accounting: Income/expense session tracker with summary and notes.
- OSINT: Planning/logging helper for professional, white-hat OSINT work (engagement register, scope, tasks, notebook, draft summary).

Yoga:
- GRACE-X Yoga module is present as a simple stretch-session planner with notes.
- It does not use external audio.js and is a non-breaking prototype card.

Legacy / experimental content
-----------------------------
The legacy/ and voice_tester/ folders contain older experiments and backup files. These reference paths such as:
- assets/boot.mp4
- assets/js/audio.js
- assets/audio/boot/boot_voice.mp3
- assets/audio/uplift/*.mp3

Those assets do not exist in this prototype and are not used by the main app.
They are kept only for reference and should be ignored for current development.

Notes
-----
- This archive is intended as a front-end prototype only (HTML/CSS/JS + audio), with no backend or persistence.
- All state is in-memory per browser tab/session.
- When making changes, keep the following pattern:
  1. Wire a module into index.html and core.js (navigation + loadModule).
  2. Build the module UI in modules/<name>.html.
  3. Add inline or per-module JS to make the UI interactive.
  4. If audio is needed, register and play it via assets/js/audioManager.js and assets/audio/VOICES_HERO/*.mp3.

This build should be treated as the reference GRACE-X AI prototype as of 22.11.25, with all main modules mounted in the sidebar and functioning as self-contained mini-tools.
