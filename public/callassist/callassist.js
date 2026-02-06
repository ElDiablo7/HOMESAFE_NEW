/* CallAssist – Assistant Panel + Brain API */
/* GRACE-X AI™ HomeSafe */

(function() {
  'use strict';

  const API_BASE = (function() {
    const o = window.location.origin;
    return (o && (o.indexOf('http://') === 0 || o.indexOf('https://') === 0))
      ? o
      : 'https://grace-x-homesafe.onrender.com';
  })();
  const BRAIN_API = API_BASE + '/api/brain';

  const TONE_OPTIONS = {
    neutral: 'Respond in a neutral, balanced tone.',
    stern: 'Respond in a stern, direct, no-nonsense tone. Be brief and authoritative.',
    sad: 'Respond in a subdued, gentle, sombre tone. Be soft and understated.',
    warm: 'Respond in a warm, friendly, encouraging tone.',
    professional: 'Respond in a professional, polished, business-appropriate tone.',
    calm: 'Respond in a calm, measured, soothing tone. Short sentences.',
    direct: 'Respond in a direct, matter-of-fact tone. Get to the point quickly.',
    empathetic: 'Respond in an empathetic, understanding tone. Acknowledge feelings.',
    formal: 'Respond in a formal, slightly formal register. Avoid casual language.',
    casual: 'Respond in a casual, conversational tone.',
    encouraging: 'Respond in an encouraging, supportive, motivational tone.'
  };

  const SUGGESTIONS = [
    'Help me prepare an agenda for this call',
    'Summarise my brief into 3 bullet points',
    'Suggest 5 questions I could ask',
    'Draft a concise opening statement',
    'List potential objections and how to respond',
    'What should I remember to mention?',
    'Give me a 30-second recap I can use to close',
    'Turn my notes into action items',
    'Suggest follow-up tasks from this call',
    'Help me prioritise my talking points'
  ];

  function initAssistant() {
    const header = document.getElementById('ca-assistant-header');
    const body = document.getElementById('ca-assistant-body');
    const output = document.getElementById('ca-brain-output');
    const input = document.getElementById('ca-brain-input');
    const sendBtn = document.getElementById('ca-brain-send');
    const clearBtn = document.getElementById('ca-brain-clear');
    const toneSelect = document.getElementById('ca-tone-select');
    const suggestionsSelect = document.getElementById('ca-suggestions-select');

    if (!header || !body || !output || !input || !sendBtn) return;

    let collapsed = false;
    const messages = [];

    // Populate suggestions dropdown
    if (suggestionsSelect) {
      suggestionsSelect.innerHTML = '<option value="">Quick suggestion…</option>';
      SUGGESTIONS.forEach(function(s, i) {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s.length > 45 ? s.slice(0, 42) + '…' : s;
        suggestionsSelect.appendChild(opt);
      });
      suggestionsSelect.addEventListener('change', function() {
        const val = this.value;
        if (val) {
          input.value = val;
          input.focus();
          this.selectedIndex = 0;
        }
      });
    }

    // Collapse toggle
    header.addEventListener('click', function() {
      collapsed = !collapsed;
      body.classList.toggle('collapsed', collapsed);
      const toggle = header.querySelector('.ca-assistant-toggle');
      if (toggle) toggle.textContent = collapsed ? '▶ Expand' : '▼ Collapse';
    });

    function appendMessage(role, text) {
      const div = document.createElement('div');
      div.className = 'ca-brain-message ca-brain-message-' + role;
      div.textContent = text;
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
    }

    function setLoading(loading) {
      sendBtn.disabled = loading;
      sendBtn.textContent = loading ? 'Thinking…' : 'Ask';
      const existing = document.getElementById('ca-brain-loading');
      if (loading && !existing) {
        const div = document.createElement('div');
        div.id = 'ca-brain-loading';
        div.className = 'ca-brain-message ca-brain-message-system';
        div.textContent = 'Thinking…';
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
      } else if (!loading && existing) {
        existing.remove();
      }
    }

    function getToneInstruction() {
      if (!toneSelect || !toneSelect.value) return '';
      return TONE_OPTIONS[toneSelect.value] || '';
    }

    async function sendQuestion() {
      const q = input.value.trim();
      if (!q) return;
      input.value = '';

      messages.push({ role: 'user', content: q });
      appendMessage('user', q);
      setLoading(true);

      const toneInstruction = getToneInstruction();
      const finalMsgs = toneInstruction
        ? [{ role: 'system', content: toneInstruction }].concat(messages)
        : messages;

      try {
        const res = await fetch(BRAIN_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'callassist',
            messages: finalMsgs,
            temperature: 0.7,
            max_tokens: 500
          })
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || data.message || 'Request failed');
        }

        const reply = (data.reply || '').trim();
        if (reply) {
          messages.push({ role: 'assistant', content: reply });
          appendMessage('ai', reply);
        }
      } catch (err) {
        appendMessage('system', 'Unable to reach GRACE. Check your connection and try again. ' + (err.message || ''));
      } finally {
        setLoading(false);
      }
    }

    sendBtn.addEventListener('click', sendQuestion);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendQuestion();
      }
    });

    // Mic button – voice input (Android-friendly: pointerdown + touchstart, no getUserMedia first)
    const micBtn = document.getElementById('ca-brain-mic');
    if (micBtn) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        micBtn.style.opacity = '0.5';
        micBtn.title = 'Voice input not supported';
      } else {
        let recognition = null;
        let isListening = false;
        let shouldListen = false;
        let isStopping = false;
        let silenceTimer = null;
        const originalPlaceholder = input.placeholder;
        input.dataset.originalPlaceholder = originalPlaceholder;

        function setMicUI(listening) {
          isListening = listening;
          micBtn.classList.toggle('listening', listening);
          micBtn.textContent = listening ? '🔴' : '🎙️';
          input.placeholder = listening ? 'Listening… (tap mic to stop)' : (input.dataset.originalPlaceholder || originalPlaceholder);
        }

        function stopRecognition() {
          if (recognition) {
            try { recognition.onstart = null; recognition.onresult = null; recognition.onerror = null; recognition.onend = null; } catch (e) {}
            try { recognition.stop(); } catch (e) {}
            recognition = null;
          }
        }

        function doStart() {
          try {
            stopRecognition();
            recognition = new SpeechRecognition();
            recognition.lang = 'en-GB';
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = function() { setMicUI(true); };

            recognition.onresult = function(event) {
              if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
              var t = '';
              for (var i = 0; i < event.results.length; i++) t += event.results[i][0].transcript;
              input.value = t;
              silenceTimer = setTimeout(function() {
                if (shouldListen && input.value.trim()) {
                  shouldListen = false;
                  isStopping = true;
                  setMicUI(false);
                  if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
                  try { if (recognition) recognition.stop(); } catch (e) {}
                  stopRecognition();
                  setTimeout(function() { if (input.value.trim() && sendBtn) sendBtn.click(); }, 120);
                }
              }, 2500);
            };

            recognition.onerror = function(event) {
              var err = (event && event.error) ? event.error : 'unknown';
              if (shouldListen && (err === 'aborted' || err === 'no-speech' || err === 'audio-capture')) {
                setTimeout(function() {
                  if (shouldListen) try { recognition && recognition.start(); } catch (e) {}
                }, 250);
                return;
              }
              if (err === 'not-allowed' || err === 'service-not-allowed') shouldListen = false;
              setMicUI(false);
              stopRecognition();
            };

            recognition.onend = function() {
              if (isStopping) { isStopping = false; setMicUI(false); stopRecognition(); return; }
              if (shouldListen) {
                setTimeout(function() {
                  if (!shouldListen) return;
                  try { stopRecognition(); doStart(); } catch (e) { setMicUI(false); stopRecognition(); }
                }, 180);
              } else {
                setMicUI(false);
                stopRecognition();
              }
            };

            recognition.start();
          } catch (e) {
            setMicUI(false);
            stopRecognition();
          }
        }

        function startListening() {
          if (shouldListen) return;
          shouldListen = true;
          var isAndroid = /Android/i.test(navigator.userAgent);
          if (window.isSecureContext && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && !isAndroid) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
              stream.getTracks().forEach(function(t) { t.stop(); });
              doStart();
            }).catch(function() { shouldListen = false; setMicUI(false); });
          } else {
            doStart();
          }
        }

        function stopListening() {
          shouldListen = false;
          isStopping = true;
          setMicUI(false);
          if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
          try { if (recognition) recognition.stop(); } catch (e) {}
          setTimeout(stopRecognition, 200);
        }

        function onMicTap(e) {
          e.preventDefault();
          e.stopPropagation();
          if (shouldListen) stopListening();
          else startListening();
        }

        micBtn.addEventListener('pointerdown', onMicTap);
        micBtn.addEventListener('touchstart', function(e) { if (e.target === micBtn) onMicTap(e); }, { passive: false });
      }
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        messages.length = 0;
        output.innerHTML = '';
        appendMessage('system', "I'm GRACE-X CallAssist. I can help with call prep, quick notes, and wrap summaries.");
      });
    }

    if (output.children.length === 0) {
      appendMessage('system', "I'm GRACE-X CallAssist. I can help with call prep, quick notes, and wrap summaries.");
    }

    // TTS: speak AI replies when voice is on
    var voiceOn = false;
    var originalAppend = appendMessage;
    appendMessage = function(role, text) {
      originalAppend(role, text);
      if (role === 'ai' && voiceOn && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(String(text).slice(0, 500));
        u.lang = 'en-GB';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      }
    };

    // Voice toggle (add to assistant header area if missing)
    var voiceToggle = document.getElementById('ca-voice-toggle');
    if (voiceToggle) {
      voiceToggle.addEventListener('click', function() {
        voiceOn = !voiceOn;
        this.textContent = voiceOn ? '🔊 Voice on' : '🔇 Voice off';
        this.classList.toggle('active', voiceOn);
      });
    }
  }

  function initLetterScanner() {
    var camBtn = document.getElementById('ca-cam-btn');
    var camInput = document.getElementById('ca-cam-input');
    var fileInput = document.getElementById('ca-file-input');
    var preview = document.getElementById('ca-letter-preview');
    var letterImg = document.getElementById('ca-letter-img');
    var readBtn = document.getElementById('ca-read-letter-btn');
    var clearBtn = document.getElementById('ca-clear-letter-btn');
    if (!camBtn || !fileInput || !preview || !letterImg || !readBtn) return;

    var lastDataUrl = null;

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      var r = new FileReader();
      r.onload = function() {
        lastDataUrl = r.result;
        letterImg.src = lastDataUrl;
        preview.style.display = 'block';
      };
      r.readAsDataURL(file);
    }

    if (camInput) camInput.addEventListener('change', function() { if (this.files[0]) handleFile(this.files[0]); });
    fileInput.addEventListener('change', function() { if (this.files[0]) handleFile(this.files[0]); });
    if (camBtn && camInput) camBtn.addEventListener('click', function() { camInput.click(); });

    clearBtn.addEventListener('click', function() {
      lastDataUrl = null;
      letterImg.src = '';
      preview.style.display = 'none';
      if (camInput) camInput.value = '';
      fileInput.value = '';
    });

    readBtn.addEventListener('click', function() {
      if (!lastDataUrl) return;
      var output = document.getElementById('ca-brain-output');
      var sendBtn = document.getElementById('ca-brain-send');
      if (!output) return;

      var userMsg = document.createElement('div');
      userMsg.className = 'ca-brain-message ca-brain-message-user';
      userMsg.textContent = 'Read this letter and draft a reply for my client.';
      output.appendChild(userMsg);
      output.scrollTop = output.scrollHeight;

      readBtn.disabled = true;
      readBtn.textContent = 'Reading…';

      var loading = document.createElement('div');
      loading.id = 'ca-vision-loading';
      loading.className = 'ca-brain-message ca-brain-message-system';
      loading.textContent = 'Reading letter…';
      output.appendChild(loading);
      output.scrollTop = output.scrollHeight;

      fetch(API_BASE + '/api/brain/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: lastDataUrl,
          prompt: 'Read this letter or document and help me draft a professional reply for my client. Be concise and clear.',
          module: 'callassist'
        })
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (loading.parentNode) loading.remove();
        var reply = (data.reply || '').trim();
        if (reply) {
          var aiMsg = document.createElement('div');
          aiMsg.className = 'ca-brain-message ca-brain-message-ai';
          aiMsg.textContent = reply;
          output.appendChild(aiMsg);
          output.scrollTop = output.scrollHeight;
        }
      }).catch(function() {
        if (loading.parentNode) loading.remove();
        var err = document.createElement('div');
        err.className = 'ca-brain-message ca-brain-message-system';
        err.textContent = 'Could not read the letter. Check your connection and try again.';
        output.appendChild(err);
        output.scrollTop = output.scrollHeight;
      }).finally(function() {
        readBtn.disabled = false;
        readBtn.textContent = 'Read & draft reply';
      });
    });
  }

  function initInstructions() {
    const header = document.getElementById('ca-instructions-header');
    const body = document.getElementById('ca-instructions-body');
    if (!header || !body) return;
    var collapsed = false;
    header.addEventListener('click', function() {
      collapsed = !collapsed;
      body.classList.toggle('collapsed', collapsed);
      var t = header.querySelector('.ca-instructions-toggle');
      if (t) t.textContent = collapsed ? '▶ Show' : '▼ Hide';
    });
  }

  function onReady() {
    initAssistant();
    initInstructions();
    initLetterScanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
