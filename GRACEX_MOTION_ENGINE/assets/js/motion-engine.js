/**
 * GRACE-X Motion Engine — Canonical
 * Single <video> controller. Src swapping only. Random clip per bucket.
 */

(function(global) {
  'use strict';

  var BUCKETS = { drift: 'drift', pulse: 'pulse', sweep: 'sweep', depth: 'depth' };
  var CLIP_COUNTS = { drift: 0, pulse: 0, sweep: 0, depth: 0 };
  var container = null;
  var video = null;
  var currentState = 'idle';

  function getBucketPath(bucket) {
    return 'assets/motion/' + bucket + '/';
  }

  function randomIndex(max) {
    if (max <= 0) return -1;
    return Math.floor(Math.random() * max);
  }

  function pickClip(bucket) {
    var n = CLIP_COUNTS[bucket];
    if (n <= 0) return null;
    var i = randomIndex(n);
    var num = (i + 1).toString().padStart(2, '0');
    return getBucketPath(bucket) + 'motion_' + num + '.mp4';
  }

  function setLayerState(state) {
    currentState = state;
    if (container) container.setAttribute('data-state', state);
  }

  function playClip(src, state) {
    if (!video) return;
    video.pause();
    video.src = src;
    video.load();
    video.playbackRate = 1;
    setLayerState(state);
    video.play().catch(function() {});
  }

  function playRandomFromBucket(bucket) {
    var src = pickClip(bucket);
    if (!src) return;
    playClip(src, bucket);
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

    video.addEventListener('canplay', function() {
      if (video.duration && isFinite(video.duration)) {
        video.currentTime = Math.random() * video.duration;
      }
    });

    var drift = document.createElement('script');
    drift.src = getBucketPath('drift') + 'count.js';
    drift.onerror = function() { CLIP_COUNTS.drift = 0; };
    document.head.appendChild(drift);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', getBucketPath('drift'), true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      countClipsInBucket('drift');
    };
    xhr.send();

    countClipsInBucket('pulse');
    countClipsInBucket('sweep');
    countClipsInBucket('depth');

    setLayerState('idle');
    playRandomFromBucket('drift');
    if (CLIP_COUNTS.drift <= 0) playRandomFromBucket('pulse');
  }

  function countClipsInBucket(bucket) {
    var base = getBucketPath(bucket);
    var n = 0;
    var req = new XMLHttpRequest();
    req.open('GET', base, true);
    req.onreadystatechange = function() {
      if (req.readyState !== 4) return;
      var html = req.responseText || '';
      var match = html.match(/motion_(\d+)\.mp4/g);
      if (match) n = match.length;
      else {
        for (var i = 1; i <= 99; i++) {
          var check = new XMLHttpRequest();
          check.open('HEAD', base + 'motion_' + (i < 10 ? '0' + i : i) + '.mp4', true);
          check.onload = function() { n++; };
          check.send();
        }
      }
      CLIP_COUNTS[bucket] = n;
    };
    req.send();
  }

  function setIdle() {
    playRandomFromBucket('drift');
    if (CLIP_COUNTS.drift <= 0) playRandomFromBucket('pulse');
  }

  function acknowledge() {
    playRandomFromBucket('pulse');
  }

  function transition() {
    playRandomFromBucket('sweep');
    if (CLIP_COUNTS.sweep <= 0) playRandomFromBucket('pulse');
  }

  function focus() {
    playRandomFromBucket('depth');
    if (CLIP_COUNTS.depth <= 0) playRandomFromBucket('pulse');
  }

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
