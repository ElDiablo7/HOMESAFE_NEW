/**
 * GRACE-X Motion Layer — Integrated Controller
 * Single <video>, src swap, manifest-driven, pulse on interaction.
 * Safe: null-checks everywhere, try/catch on fetch, no errors if DOM missing.
 */
(function() {
  'use strict';

  var container = null;
  var video = null;
  var manifest = null;
  var allClips = [];
  var driftClips = [];
  var pulseClips = [];
  var pulseTimeout = null;
  var basePath = 'assets/motion/';

  function pick(pool) {
    if (!pool || pool.length === 0) return null;
    return basePath + pool[Math.floor(Math.random() * pool.length)];
  }

  function setMotion(src, speed) {
    if (!video || !src) return;
    try {
      video.pause();
      video.src = src;
      video.playbackRate = speed || 0.75;
      video.load();
      video.addEventListener('loadedmetadata', function onMeta() {
        video.removeEventListener('loadedmetadata', onMeta);
        var dur = video.duration || 0;
        if (dur > 2) video.currentTime = Math.random() * Math.min(dur - 0.4, 6.0);
      });
      video.play().catch(function() {});
    } catch (e) {
      console.warn('[Motion Layer] play failed:', e);
    }
  }

  function setIdle() {
    document.documentElement.style.setProperty('--motion-opacity', '0.08');
    document.documentElement.style.setProperty('--motion-blur', '0px');
    if (container) container.classList.remove('motion-pulse');
    setMotion(pick(driftClips.length ? driftClips : allClips), 0.75);
  }

  function pulseMotion(reason) {
    if (!container) return;
    document.documentElement.style.setProperty('--motion-opacity', '0.18');
    document.documentElement.style.setProperty('--motion-blur', '1px');
    container.classList.add('motion-pulse');
    var clip = pick(pulseClips.length ? pulseClips : allClips);
    if (clip) setMotion(clip, 1.0);
    if (pulseTimeout) clearTimeout(pulseTimeout);
    pulseTimeout = setTimeout(function() {
      setIdle();
    }, 1800);
  }

  function loadManifest(cb) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', basePath + 'manifest.json', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            manifest = JSON.parse(xhr.responseText);
            allClips = manifest.clips || [];
            driftClips = manifest.drift || allClips.slice(0, Math.ceil(allClips.length / 2));
            pulseClips = manifest.pulse || allClips.slice(Math.ceil(allClips.length / 2));
          } catch (e) {}
        }
        cb();
      };
      xhr.onerror = function() { cb(); };
      xhr.send();
    } catch (e) { cb(); }
  }

  function fallbackClips() {
    if (allClips.length > 0) return;
    for (var i = 1; i <= 14; i++) {
      var name = 'motion_' + String(i).padStart(2, '0') + '.mp4';
      allClips.push(name);
    }
    driftClips = allClips.slice(0, 7);
    pulseClips = allClips.slice(7);
  }

  function initMotionLayer() {
    container = document.getElementById('gracexMotionLayer');
    if (!container) return;

    video = document.getElementById('gracexMotionVid');
    if (!video) {
      video = container.querySelector('video');
    }
    if (!video) return;

    loadManifest(function() {
      fallbackClips();
      // Boot chain: brief pulse then settle to idle
      document.documentElement.style.setProperty('--motion-opacity', '0.14');
      setMotion(pick(pulseClips.length ? pulseClips : allClips), 1.0);
      setTimeout(setIdle, 1800);
    });

    // Delegated click listener for module interactions
    document.addEventListener('click', function(e) {
      var target = e.target;
      if (!target) return;
      var isModule = target.closest('.module-btn') ||
                     target.closest('[data-module]') ||
                     target.closest('nav a') ||
                     (target.tagName === 'BUTTON' && target.closest('.module-nav'));
      if (isModule) {
        pulseMotion('module-click');
      }
    });
  }

  // Expose globally
  window.GRACEX_MotionLayer = {
    init: initMotionLayer,
    setIdle: setIdle,
    pulse: pulseMotion
  };

  // Auto-start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotionLayer);
  } else {
    setTimeout(initMotionLayer, 50);
  }
})();
