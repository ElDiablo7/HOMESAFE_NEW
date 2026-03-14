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

  const hairStyles = {
    none: null,
    waves: 'https://cdn-icons-png.flaticon.com/512/3246/3246193.png',
    bob: 'https://cdn-icons-png.flaticon.com/512/3246/3246187.png',
    bangs: 'https://cdn-icons-png.flaticon.com/512/3246/3246201.png',
    ponytail: 'https://cdn-icons-png.flaticon.com/512/3246/3246195.png'
  };

  const hairColors = {
    none: 'none',
    rose: 'hue-rotate(320deg) saturate(2) brightness(0.9)',
    platinum: 'grayscale(1) brightness(1.5)',
    copper: 'hue-rotate(20deg) saturate(1.5) brightness(0.8)',
    lavender: 'hue-rotate(260deg) saturate(1.2) brightness(1.1)'
  };

  function applyHairColor(colorKey) {
    const filter = hairColors[colorKey] || 'none';
    videoEl.style.filter = filter === 'none' ? '' : filter;
    log(`Applied color filter: ${colorKey}`);
    
    document.querySelectorAll('#hairColors .filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-color') === colorKey);
    });
  }

  function applyHairstyle(styleKey) {
    const overlay = $("arOverlay");
    if (!overlay) return;
    
    overlay.innerHTML = '';
    const src = hairStyles[styleKey];
    
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'ar-hairstyle active';
      overlay.appendChild(img);
      log(`Applied hairstyle: ${styleKey}`);
    } else {
      log('Cleared hairstyle overlay');
    }

    document.querySelectorAll('#hairStyles .filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-hair') === styleKey);
    });
  }

  // --------- AR Mirror ----------
  async function startCamera(){
    try{
      if(state.stream) return;

      setStatus("Starting Beauty Mirror…");
      log("Initializing High-Def Beauty Stream...");

      const constraints = {
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      state.stream = stream;
      videoEl.srcObject = stream;
      
      $("btnCamStart").style.display = "none";
      $("btnCamStop").style.display = "block";

      setStatus("Mirror Live");
      log("Mirror is live. ✨ You look fabulous!");
      setOverlayText("Beauty Mirror active. Select a hairstyle or filter to begin.");
    }catch(e){
      log(`Mirror error: ${e?.message || "Verify permissions"}`);
      setStatus("Mirror Blocked");
    }
  }

  function stopCamera(){
    if(!state.stream) return;
    state.stream.getTracks().forEach(t => t.stop());
    state.stream = null;
    if(videoEl) videoEl.srcObject = null;
    
    $("btnCamStart").style.display = "block";
    $("btnCamStop").style.display = "none";
    
    setStatus("Mirror Idle");
    log("Mirror closed.");
    setOverlayText("Ready for your next look?");
  }

  function snapshot(){
    if(!videoEl || !videoEl.videoWidth){
      log("Snapshot failed: Mirror not live.");
      return;
    }
    const w = videoEl.videoWidth;
    const h = videoEl.videoHeight;

    canvasEl.width = w;
    canvasEl.height = h;

    const ctx = canvasEl.getContext("2d");
    
    // Reverse mirroring for the actual photo
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    
    // Apply filters if any
    if (videoEl.style.filter) ctx.filter = videoEl.style.filter;
    
    ctx.drawImage(videoEl, 0, 0, w, h);
    ctx.restore();

    state.lastSnapshotDataUrl = canvasEl.toDataURL("image/jpeg", 0.9);
    shotImg.src = state.lastSnapshotDataUrl;
    shotBox.style.display = "block";

    log("Snapshot saved to your device. 📸");
    setStatus("Snapshot Taken");
  }

  function setOverlayText(txt){
    if(hudText) hudText.textContent = txt;
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
    $("btnSnap")?.addEventListener("click", snapshot);

    // Hairstyle selection
    document.querySelectorAll('#hairStyles .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyHairstyle(btn.getAttribute('data-hair'));
      });
    });

    // Color selection
    document.querySelectorAll('#hairColors .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyHairColor(btn.getAttribute('data-color'));
      });
    });

    // Analyse buttons
    $("btnAnalyseSkin")?.addEventListener("click", ()=>{
      const msg = `AI Skin Audit requested. I've inspected my skin in the mirror. Provide a detailed analysis and a 7-day rose-gold glow routine.`;
      $("userText").value = msg;
      talkToGrace(msg);
    });

    log("Beauty 2.0 Loaded. ✨ Let's get glamorous!");
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
