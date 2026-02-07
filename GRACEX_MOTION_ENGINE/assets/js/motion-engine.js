/**
 * GRACE-X Motion Engine — Canonical
 * Single <video> controller. Src swapping only. Random clip per bucket.
 */

(function(global) {
  'use strict';

  var manifest = { drift: 0, pulse: 0, sweep: 0, depth: 0 };
  var container = null;
  var video = null;

  function pick(bucket) {
    if (!manifest[bucket] || manifest[bucket] === 0) {
      console.warn('No clips in ' + bucket);
      return null;
    }
    var i = Math.floor(Math.random() * manifest[bucket]) + 1;
    return 'assets/motion/' + bucket + '/motion_' + String(i).padStart(2, '0') + '.mp4';
  }

  function play(bucket) {
    var src = pick(bucket);
    if (!src) return false;
    if (!video) return false;
    video.pause();
    video.src = src;
    video.load();
    video.playbackRate = 1;
    if (container) container.setAttribute('data-state', bucket);
    video.play().catch(function() {});
    return true;
  }

  function loadManifest(done) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'assets/motion/manifest.json', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var m = JSON.parse(xhr.responseText);
          manifest.drift = m.drift | 0;
          manifest.pulse = m.pulse | 0;
          manifest.sweep = m.sweep | 0;
          manifest.depth = m.depth | 0;
        } catch (e) {}
      }
      done();
    };
    xhr.onerror = function() { done(); };
    xhr.send();
  }

  function init() {
    container = document.getElementById('motion-layer');
    if (!container) return;

    video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    container.appendChild(video);

    video.addEventListener('loadedmetadata', function() {
      if (video.duration && isFinite(video.duration)) {
        video.currentTime = Math.random() * video.duration;
      }
    });

    loadManifest(function() {
      container.setAttribute('data-state', 'idle');
      if (!play('drift')) play('pulse');
    });
  }

  function setIdle()      { if (!play('drift')) play('pulse'); }
  function acknowledge()  { play('pulse'); }
  function transition()   { if (!play('sweep')) play('pulse'); }
  function focus()        { if (!play('depth')) play('pulse'); }

  global.GRACEX_MOTION_ENGINE = {
    setIdle: setIdle,
    acknowledge: acknowledge,
    transition: transition,
    focus: focus
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(this);
