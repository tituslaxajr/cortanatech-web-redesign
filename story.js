/*
 * story.js — scroll-narrative engine for pinned scenes. No dependencies.
 *
 * Contract (HTML):
 *   [data-scene]            registers the element as a scene
 *   [data-pin]              pinned scene: tall wrapper + sticky .scene-stage;
 *                           wrapper height comes from CSS --scene-length
 *   [data-scene-steps="N"]  engine mirrors progress to data-step="0..N-1"
 *   [data-progress-var]     custom property name (default: --progress)
 *   [data-count-at="k"]     at step >= k, fire Enhance.countIn(scene) once
 *   [data-ripple-at="k"]    at step >= k, add .is-rippling (CSS rings) and,
 *                           if a [data-water] canvas is reachable, land a
 *                           WebGL drop at [data-ripple-pos="x,y"] (0..1)
 *
 * Output per frame: ONE CSS custom property per scene (--progress, 0..1),
 * quantized and change-gated. CSS does all the visual mapping.
 *
 * THE INVARIANT: CSS declares [data-scene] { --progress: 1 } — the finished
 * composition. This engine only overrides it downward while scrubbing on
 * desktop with motion allowed. No-JS / reduced-motion / mobile / ancient
 * browsers all render the complete final state.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // CSS defaults are the final state
  if (!window.CSS || !CSS.supports || !CSS.supports('position', 'sticky')) return;

  var scenes = [];
  var mqDesktop = window.matchMedia('(min-width: 901px)');
  var ticking = false;

  function register(el) {
    scenes.push({
      el: el,
      pinned: el.hasAttribute('data-pin'),
      steps: parseInt(el.getAttribute('data-scene-steps'), 10) || 0,
      varName: el.getAttribute('data-progress-var') || '--progress',
      countAt: el.hasAttribute('data-count-at') ? parseInt(el.getAttribute('data-count-at'), 10) : -1,
      rippleAt: el.hasAttribute('data-ripple-at') ? parseInt(el.getAttribute('data-ripple-at'), 10) : -1,
      counted: false,
      rippled: false,
      top: 0, span: 1, p: -1, step: -1,
      subs: []
    });
  }

  function measure() {
    var y = window.pageYOffset;
    var vh = window.innerHeight;
    scenes.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      s.top = r.top + y;
      s.span = s.pinned
        ? Math.max(1, r.height - vh)   // pinned: transit of the tall wrapper
        : r.height + vh;               // parallax: transit through the viewport
    });
  }

  function fireRipple(s) {
    s.el.classList.add('is-rippling');
    var pos = (s.el.getAttribute('data-ripple-pos') || '0.5,0.5').split(',');
    var host = s.el.closest('[data-water]') || s.el.querySelector('[data-water]');
    if (host && host.waterAPI && window.WaterRipple) {
      window.WaterRipple.burst(host, parseFloat(pos[0]), parseFloat(pos[1]));
    }
  }

  function stepCheck(s, p) {
    var step = Math.min(s.steps - 1, Math.floor(p * s.steps));
    if (step === s.step) return;
    var prev = s.step;
    s.step = step;
    s.el.setAttribute('data-step', String(step));
    if (s.countAt >= 0 && !s.counted && step >= s.countAt && window.Enhance) {
      s.counted = true;
      window.Enhance.countIn(s.el);
    }
    if (s.rippleAt >= 0 && !s.rippled && step >= s.rippleAt) {
      s.rippled = true;
      fireRipple(s);
    }
    s.el.dispatchEvent(new CustomEvent('story:step', {
      bubbles: true,
      detail: { name: s.el.getAttribute('data-scene'), step: step, prevStep: prev, progress: p }
    }));
  }

  function update() {
    ticking = false;
    if (!mqDesktop.matches) return;
    var y = window.pageYOffset, vh = window.innerHeight;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      var raw = s.pinned ? (y - s.top) / s.span : (y + vh - s.top) / s.span;
      var p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      p = Math.round(p * 10000) / 10000;
      if (p === s.p) continue;
      s.p = p;
      s.el.style.setProperty(s.varName, String(p));
      s.el.classList.toggle('scene-active', p > 0 && p < 1);
      if (s.steps) stepCheck(s, p);
      for (var j = 0; j < s.subs.length; j++) s.subs[j](s);
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  function resetScenes() {
    // Small screens: clear inline overrides so the CSS default (--progress: 1,
    // the finished layout) applies and scenes flow statically.
    scenes.forEach(function (s) {
      s.el.style.removeProperty(s.varName);
      s.el.classList.remove('scene-active');
      s.p = -1;
    });
  }

  function init() {
    [].slice.call(document.querySelectorAll('[data-scene]')).forEach(register);
    if (!scenes.length) return;
    document.documentElement.classList.add('js-story');

    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); onScroll(); });
    window.addEventListener('load', function () { measure(); onScroll(); });
    var onMq = function (e) {
      if (e.matches) { measure(); onScroll(); }
      else resetScenes();
    };
    if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', onMq);
    else if (mqDesktop.addListener) mqDesktop.addListener(onMq);
    if (!mqDesktop.matches) resetScenes();
  }

  window.Story = {
    refresh: function () { measure(); onScroll(); },
    on: function (name, fn) {
      scenes.forEach(function (s) {
        if (s.el.getAttribute('data-scene') === name) s.subs.push(function (sc) {
          fn({ el: sc.el, progress: sc.p, step: sc.step });
        });
      });
    },
    get: function (name) {
      for (var i = 0; i < scenes.length; i++) {
        if (scenes[i].el.getAttribute('data-scene') === name) {
          return { el: scenes[i].el, progress: scenes[i].p, step: scenes[i].step };
        }
      }
      return null;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
