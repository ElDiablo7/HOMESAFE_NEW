/* =====================================================
   GRACE-X VENUS™ v1.0 
   Anti-Hacking Cyber Security Module
   ===================================================== */

(function () {
  'use strict';

  function initVenus() {
    console.log("[VENUS] Initializing module...");
    
    // ----------------------------------------------------------------
    // 1. LOGIN OVERLAY LOGIC
    // ----------------------------------------------------------------
    const loginOverlay = document.getElementById('venus-login-overlay');
    const mainContent = document.getElementById('venus-main-content');
    const loginIdInput = document.getElementById('venus-login-id');
    const loginPassInput = document.getElementById('venus-login-pass');
    const loginSaveCheck = document.getElementById('venus-login-save');
    const loginBtn = document.getElementById('venus-login-btn');
    const loginError = document.getElementById('venus-login-error');

    if (loginOverlay && mainContent) {
      // Load saved credentials
      const savedId = localStorage.getItem('venus_saved_id');
      const savedPass = localStorage.getItem('venus_saved_pass');
      if (savedId && savedPass) {
        loginIdInput.value = savedId;
        loginPassInput.value = savedPass;
        loginSaveCheck.checked = true;
      }

      const processLogin = () => {
        const id = loginIdInput.value.trim();
        const pass = loginPassInput.value.trim();

        if (id && pass) {
          // Accept any login for demo / ease of use, but save if requested
          if (loginSaveCheck.checked) {
            localStorage.setItem('venus_saved_id', id);
            localStorage.setItem('venus_saved_pass', pass);
          } else {
            localStorage.removeItem('venus_saved_id');
            localStorage.removeItem('venus_saved_pass');
          }

          // Unveil main app
          loginOverlay.style.opacity = '0';
          setTimeout(() => {
            loginOverlay.style.display = 'none';
            mainContent.style.display = 'block';
            console.log("[VENUS] Access Granted.");
            
            // Introduce Venus
            if (window.GRACEX_TTS && window.GRACEX_TTS.isEnabled()) {
                window.GRACEX_TTS.speak("Access granted. Venus online. All honeypots armed.");
            }
          }, 400); // fade out duration
        } else {
          loginError.style.display = 'block';
          // Shake effect
          loginOverlay.querySelector('.venus-card').style.transform = 'translate(5px, 0)';
          setTimeout(() => loginOverlay.querySelector('.venus-card').style.transform = 'translate(-5px, 0)', 50);
          setTimeout(() => loginOverlay.querySelector('.venus-card').style.transform = 'translate(5px, 0)', 100);
          setTimeout(() => loginOverlay.querySelector('.venus-card').style.transform = 'translate(0, 0)', 150);
        }
      };

      loginBtn.addEventListener('click', processLogin);
      loginPassInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') processLogin();
      });
      // Clear error on interact
      loginIdInput.addEventListener('input', () => loginError.style.display = 'none');
      loginPassInput.addEventListener('input', () => loginError.style.display = 'none');
    }

    // ----------------------------------------------------------------
    // 2. VENUS AI BRAIN WIRING
    // ----------------------------------------------------------------
    if (typeof window.setupModuleBrain === 'function') {
      window.setupModuleBrain('venus', {
        inputId: 'venus-brain-input',
        sendBtnId: 'venus-brain-send',
        outputId: 'venus-brain-output',
        micBtnId: 'venus-brain-mic',
        clearBtnId: 'venus-brain-clear',
        botName: 'Venus'
      });
    } else {
      console.warn("[VENUS] setupModuleBrain not found! Ensure brainV5Helper.js is loaded.");
      // Fallback
      document.getElementById('venus-brain-send')?.addEventListener('click', () => {
        const input = document.getElementById('venus-brain-input');
        if (input && input.value) {
            alert('Venus Brain API missing. Received: ' + input.value);
            input.value = '';
        }
      });
    }

    // Custom clear button behavior if needed (setupModuleBrain does most of it, but sometimes we want custom Welcome text)
    const clearBtn = document.getElementById('venus-brain-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            setTimeout(() => {
                const out = document.getElementById('venus-brain-output');
                if (out) {
                    out.innerHTML = `<div class="brain-message brain-message-system venus-message">
                      Venus online. All honeypots armed and monitoring. I'm ready to trap anyone stupid enough to try attacking this system. What do you need?
                    </div>`;
                }
            }, 50); // wait for setupModuleBrain to clear first
        });
    }

    // ----------------------------------------------------------------
    // 3. UI INTERACTIONS
    // ----------------------------------------------------------------
    // Just some basic interactions for the UI to feel alive
    const armAllBtn = document.getElementById('venus-arm-all');
    if (armAllBtn) {
        armAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.honeypot-status').forEach(el => {
                el.className = 'honeypot-status armed';
                el.textContent = 'ARMED';
            });
            alert('All honeypot systems armed to maximum lethality.');
        });
    }
  }

  // Load via normal script tag OR grace-x module router
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVenus);
  } else {
    initVenus();
  }

  // If GRACE-X SPA router loads us, run initialization
  document.addEventListener('gracex:module:loaded', (e) => {
    if (e.detail && e.detail.module === 'venus') {
      // Small timeout to ensure DOM is firmly in place
      setTimeout(initVenus, 50);
    }
  });

})();
