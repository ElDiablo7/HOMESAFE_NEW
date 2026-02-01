/* GRACE-X Beauty™ — AR Mirror + panel wiring */
(function(){
  const $ = (id) => document.getElementById(id);

  const state = {
    kidsPresent: false,
    quickMode: "default",
    facingMode: "user",   // "user" or "environment"
    stream: null,
    lastSnapshotDataUrl: null
  };

  const logEl = $("beautyLog");
  const statusEl = $("beautyStatus");
  const hudText = $("hudText");
  const videoEl = $("mirrorVideo");
  const canvasEl = $("snapCanvas");
  const shotBox = $("shotBox");
  const shotImg = $("shotImg");

  function setStatus(txt){
    if(statusEl) statusEl.innerHTML = `Status: <b>${txt}</b>`;
  }
  function log(line){
    if(!logEl) return;
    const t = new Date().toLocaleTimeString();
    logEl.innerHTML = `[${t}] ${escapeHtml(line)}<br/>` + logEl.innerHTML;
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (c)=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function buildPayload(userText){
    const routine = ($("routineList")?.value || "").trim();
    const goal = ($("goal")?.value || "").trim();
    const quickMode = $("quickMode")?.value || "default";
    const arMode = $("arMode")?.value || "skin";

    const parts = [];
    parts.push(`MODULE: beauty`);
    parts.push(`kidsPresent: ${state.kidsPresent ? "true" : "false"}`);
    parts.push(`quickMode: ${quickMode}`);
    parts.push(`arMode: ${arMode}`);
    if(goal) parts.push(`goal: ${goal}`);
    if(routine) parts.push(`currentRoutine:\n${routine}`);

    // We DO NOT send image data (keeps it lightweight + avoids false assumptions).
    if(state.lastSnapshotDataUrl){
      parts.push(`snapshot: taken (available locally in panel, not attached)`);
    }

    parts.push(`request:\n${userText}`);
    return parts.join("\n\n");
  }

  async function talkToGrace(userText){
    const text = (userText || "").trim();
    if(!text){ log("Nothing to send."); return; }

    const payload = buildPayload(text);
    setStatus("Sending…");
    log("→ TalkToGrace: sending payload");

    try{
      if(window.GRACEX_CORE && typeof window.GRACEX_CORE.talkToGrace === "function"){
        const reply = await window.GRACEX_CORE.talkToGrace(payload, { module:"beauty" });
        log(`← Reply: ${String(reply || "")}`);
        setStatus("Replied");
        return;
      }
      if(typeof window.talkToGrace === "function"){
        const reply = await window.talkToGrace(payload, { module:"beauty" });
        log(`← Reply: ${String(reply || "")}`);
        setStatus("Replied");
        return;
      }
      if(window.moduleBrains && typeof window.moduleBrains.beauty === "function"){
        const reply = await window.moduleBrains.beauty(payload);
        log(`← Reply: ${String(reply || "")}`);
        setStatus("Replied");
        return;
      }

      log("⚠ Not wired: no GRACEX_CORE.talkToGrace / talkToGrace / moduleBrains.beauty found.");
      setStatus("Not wired");
    }catch(err){
      log(`✖ Error: ${err?.message || String(err)}`);
      setStatus("Error");
    }
  }

  // --------- AR Mirror ----------
  async function startCamera(){
    try{
      if(state.stream) return;

      setStatus("Starting camera…");
      log(`Camera start (facingMode=${state.facingMode})`);

      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: state.facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      state.stream = stream;
      videoEl.srcObject = stream;

      setStatus("Camera live");
      log("Camera live.");
    }catch(e){
      log(`Camera error: ${e?.message || String(e)}`);
      setStatus("Camera blocked");
    }
  }

  function stopCamera(){
    if(!state.stream) return;
    state.stream.getTracks().forEach(t => t.stop());
    state.stream = null;
    if(videoEl) videoEl.srcObject = null;
    setStatus("Camera stopped");
    log("Camera stopped.");
  }

  async function flipCamera(){
    state.facingMode = (state.facingMode === "user") ? "environment" : "user";
    log(`Flip camera → ${state.facingMode}`);
    stopCamera();
    await startCamera();
  }

  function snapshot(){
    if(!videoEl || !videoEl.videoWidth){
      log("Snapshot failed: camera not live.");
      return;
    }
    const w = videoEl.videoWidth;
    const h = videoEl.videoHeight;

    canvasEl.width = w;
    canvasEl.height = h;

    const ctx = canvasEl.getContext("2d");
    // un-mirror when capturing so image isn't reversed
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoEl, 0, 0, w, h);
    ctx.restore();

    state.lastSnapshotDataUrl = canvasEl.toDataURL("image/jpeg", 0.85);

    shotImg.src = state.lastSnapshotDataUrl;
    shotBox.style.display = "block";

    log("Snapshot captured (local).");
    setStatus("Snapshot saved");
  }

  function setOverlayText(mode){
    if(!hudText) return;
    const map = {
      skin: "Skin scan: neutral light, no flash, camera at eye level. Note redness, texture, shine.",
      makeup: "Makeup check: symmetry + blending. Look for creasing, patchiness, separation zones.",
      hair: "Hair check: frizz + flyaways. Check crown + ends. Note dryness vs oil at roots.",
      lighting: "Lighting: face a window. Avoid overhead. If shadows under eyes, move light forward."
    };
    hudText.textContent = map[mode] || map.skin;
  }

  // --------- UI Bind ----------
  function bind(){
    // Tiny-brain buttons
    document.querySelectorAll("[data-prompt]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const t = btn.getAttribute("data-prompt") || "";
        $("userText").value = t;
        log(`Loaded prompt: ${t}`);
        setStatus("Prompt loaded");
      });
    });

    $("btnSend")?.addEventListener("click", ()=> talkToGrace($("userText")?.value || ""));
    $("btnReset")?.addEventListener("click", ()=>{
      $("userText").value = "";
      $("routineList").value = "";
      $("goal").value = "";
      $("quickMode").value = "default";
      state.lastSnapshotDataUrl = null;
      if(shotBox) shotBox.style.display = "none";
      log("Reset inputs.");
      setStatus("Idle");
    });

    $("kidsOn")?.addEventListener("click", ()=>{
      state.kidsPresent = true;
      log("kidsPresent: TRUE");
      setStatus("Kids-safe");
    });
    $("kidsOff")?.addEventListener("click", ()=>{
      state.kidsPresent = false;
      log("kidsPresent: FALSE");
      setStatus("Idle");
    });

    $("userText")?.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" && (e.ctrlKey || e.metaKey)){
        e.preventDefault();
        talkToGrace($("userText")?.value || "");
      }
    });

    // AR controls
    $("btnCamStart")?.addEventListener("click", startCamera);
    $("btnCamStop")?.addEventListener("click", stopCamera);
    $("btnCamFlip")?.addEventListener("click", flipCamera);
    $("btnSnap")?.addEventListener("click", snapshot);

    $("arMode")?.addEventListener("change", ()=>{
      setOverlayText($("arMode").value);
      log(`Overlay mode: ${$("arMode").value}`);
    });
    setOverlayText($("arMode")?.value || "skin");

    // Analyse buttons (send a useful prompt based on the overlay mode)
    $("btnAnalyseSkin")?.addEventListener("click", ()=>{
      const mode = $("arMode")?.value || "skin";
      const msg = `AR Mirror analysis (${mode}). I’ve taken a snapshot locally. Ask me 5 quick questions max, then give me a 2-week plan.`;
      $("userText").value = msg;
      talkToGrace(msg);
    });

    $("btnMakeupCheck")?.addEventListener("click", ()=>{
      const msg = `Makeup check using AR Mirror. I’ve taken a snapshot locally. Troubleshoot: creasing/caking/separation/patchiness. Give quick fixes + next-time routine.`;
      $("userText").value = msg;
      talkToGrace(msg);
    });

    log("Beauty panel loaded (AR Mirror ready).");
    setStatus("Idle");
  }

  bind();
})();
// ============================================
// BRAIN WIRING - Level 5 Integration
// ============================================
function wireBeautyBrain() {
  if (typeof window.setupModuleBrain !== 'function') {
    console.warn('[BEAUTY] Brain system not available - running standalone');
    return;
  }

  window.setupModuleBrain('beauty', {
    capabilities: {
      hasARMirror: true,
      hasSkinAnalysis: true,
      hasMakeupGuide: true,
      hasRoutines: true
    },

    onQuery: async (query) => {
      return 'Beauty AR mirror ready. How can I help with skincare or makeup?';
    }
  });

  console.log('[BEAUTY] ✅ Brain wired - Level 5 integration active');
}

// Wire brain on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireBeautyBrain);
} else {
  wireBeautyBrain();
}
