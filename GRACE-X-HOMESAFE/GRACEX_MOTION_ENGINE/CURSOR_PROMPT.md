# GRACE-X Motion Engine — Canonical Cursor Prompt

You are working inside the **GRACE-X Motion Engine**.

This system is **infrastructure**, not decoration.
Motion here represents **system state**, not content.

---

## CORE INTENT (NON-NEGOTIABLE)

- MP4 files are **motion primitives**, not videos or scenes
- Motion is always **background**
- Motion never explains UI or content
- Motion must feel alive, not performative

If a change violates this intent, **delete it and correct course**.

---

## SINGLE SOURCE OF TRUTH

**All background motion MUST live inside:**

```
/GRACEX_MOTION_ENGINE/
├─ index.html                  # local test harness
├─ CURSOR_PROMPT.md            # this file
├─ assets/
│  ├─ motion/
│  │  ├─ manifest.json         # clip counts per bucket
│  │  ├─ drift/                # slow, ambient, float, idle
│  │  ├─ pulse/                # jet light, ignition, flare
│  │  ├─ sweep/                # lateral, directional
│  │  └─ depth/                # forward, tunnel, focus
│  ├─ css/
│  │  └─ motion.css            # single layer, vars only
│  └─ js/
│     └─ motion-engine.js      # single <video> controller
```

No MP4 files are permitted elsewhere in the repo for background or UI motion.

If MP4s are found outside the Motion Engine:
- Either ingest them into the engine
- Or delete them and repoint consumers to the engine

There is **one motion system only**.

---

## MOTION BUCKETS

Every MP4 belongs to **exactly one** bucket:

- `drift/`  — slow, ambient, floating, idle consciousness
- `pulse/`  — jet light, ignition, acknowledgement, boot
- `sweep/`  — lateral or directional transitions
- `depth/`  — forward motion, tunnel, focus, lock, laser

No clip may exist outside these buckets.

| Bucket    | Default opacity |
|-----------|-----------------|
| `drift`   | 0.08            |
| `pulse`   | 0.18            |
| `sweep`   | 0.14            |
| `depth`   | 0.12            |

---

## FILE NAMING

Inside each bucket folder, clips are named sequentially:

```
motion_01.mp4
motion_02.mp4
motion_03.mp4
```

Zero-padded, two digits, starting at 01.

---

## MANIFEST (REQUIRED)

`assets/motion/manifest.json` is authoritative.

It must contain clip counts only:

```json
{
  "drift": 0,
  "pulse": 2,
  "sweep": 0,
  "depth": 0
}
```

When you add or remove a clip, **update the count**. The engine reads this on init. If the count is wrong, clips will not play. If manifest says 2, there are exactly 2 clips in that bucket.

---

## HOW TO ADD A NEW MP4

1. Classify the clip into one bucket: drift, pulse, sweep, or depth
2. Place it in `assets/motion/<bucket>/`
3. Rename it to `motion_XX.mp4` (next sequential number)
4. Update the count in `manifest.json`
5. Done. No code changes required.

---

## THE ENGINE

`motion-engine.js` exposes one global: `GRACEX_MOTION_ENGINE`

### Functions

| Function         | Behaviour                                  |
|------------------|--------------------------------------------|
| `setIdle()`      | Play random drift clip (pulse fallback)    |
| `acknowledge()`  | Play random pulse clip                     |
| `transition()`   | Play random sweep clip (pulse fallback)    |
| `focus()`        | Play random depth clip (pulse fallback)    |

### Core pick logic

```js
function pick(bucket) {
  if (!manifest[bucket] || manifest[bucket] === 0) {
    console.warn('No clips in ' + bucket);
    return null;
  }
  var i = Math.floor(Math.random() * manifest[bucket]) + 1;
  return 'assets/motion/' + bucket + '/motion_' + String(i).padStart(2, '0') + '.mp4';
}
```

This is the canonical selection function. Do not abstract it further.

### Video element rules

- Single `<video>` element, created once
- `autoplay`, `muted`, `loop`, `playsinline`
- Random `currentTime` on `loadedmetadata`
- State changes via `src` swap only
- No keyframes, no JS animation, no transitions on the video

---

## CSS RULES

`motion.css` controls intensity through CSS variables only:

```css
--motion-opacity-idle:  0.08;
--motion-opacity-pulse: 0.18;
--motion-opacity-sweep: 0.14;
--motion-opacity-depth: 0.12;
--motion-opacity: var(--motion-opacity-idle);
--motion-blur: 0px;
```

The motion layer:
- `position: fixed; inset: 0;`
- `pointer-events: none;`
- `z-index: 0;`
- Video inside: `object-fit: cover;`
- Opacity and blur driven by vars
- **No CSS animations. No keyframes. No transitions.**

The `data-state` attribute on `.motion-layer` selects which opacity var is active.

---

## NON-NEGOTIABLES

1. **One motion layer.** One `<video>`. One source at a time.
2. **Motion is background infrastructure.** It does not carry meaning, narrative, or text.
3. **No text over pulse.** Pulse is system acknowledgement, not a backdrop for copy.
4. **CSS controls intensity.** Opacity and blur via vars. Nothing else.
5. **No placeholders.** No TODOs. No "coming soon". No demo fluff.
6. **No frameworks.** No build step. No dependencies.
7. **Manifest is truth.** If it says 2, there are 2 clips. Keep it accurate.

---

## INTEGRATION

To use the motion engine in the main GRACE-X app:

1. Include `motion.css` in your page
2. Add `<div id="motion-layer" class="motion-layer" aria-hidden="true"></div>` before your UI
3. Include `motion-engine.js` at the end of body
4. Call `GRACEX_MOTION_ENGINE.setIdle()` on load
5. Call other functions in response to system events

The engine self-initialises on DOMContentLoaded. The test harness (`index.html`) demonstrates all four states.
