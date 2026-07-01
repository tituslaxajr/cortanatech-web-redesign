/*
 * Progressive enhancement: scroll-reveal + count-up stats.
 * - Elements with class `reveal` fade/slide in when scrolled into view.
 * - Elements with [data-count] animate 0 -> target the first time they appear.
 *
 * Robustness:
 * - The hidden state is applied ONLY when this script runs (via the `js-anim`
 *   class on <html>), so if JS fails or is disabled, content stays visible.
 * - Reveal uses a scroll/resize check (rAF-throttled) rather than relying on
 *   IntersectionObserver, so nothing can get stuck invisible.
 * - Respects prefers-reduced-motion (everything shown immediately, no motion).
 */
(function () {
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    if (el.dataset.counted === '1') return;
    el.dataset.counted = '1';
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1100; // ms
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  function inView(el, margin) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * margin && r.bottom > 0;
  }

  function init() {
    var counters = [].slice.call(document.querySelectorAll('[data-count]'));
    var reveals = [].slice.call(document.querySelectorAll('.reveal'));

    // Reduced motion: show everything immediately, set final counter values.
    if (prefersReduced) {
      reveals.forEach(function (el) { el.classList.add('reveal-in'); });
      counters.forEach(function (el) {
        el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
      });
      return;
    }

    // Enable the animated (initially-hidden) state now that JS is running.
    document.documentElement.classList.add('js-anim');

    var ticking = false;
    function check() {
      ticking = false;
      reveals = reveals.filter(function (el) {
        if (inView(el, 0.92)) { el.classList.add('reveal-in'); return false; }
        return true;
      });
      counters = counters.filter(function (el) {
        if (inView(el, 0.85)) { countUp(el); return false; }
        return true;
      });
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(check); }
    }

    check(); // reveal whatever is already in view on load
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
