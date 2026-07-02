/*
 * meeting.js — homepage-only wiring for "The First Meeting".
 *
 * Sections it drives: role picker (hero), pain cards, cost calculator,
 * proof swap, timeline accordion, and the pre-drafted contact finale.
 * All render functions are idempotent; everything re-renders on
 * `rolechange` and on bfcache restore.
 *
 * Requires meeting-data.js + role.js. The interactive shells are hidden
 * until this script adds `js-meeting` to <html>, so no-JS visitors see
 * the complete generic page instead of dead controls.
 */
(function () {
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var state = { pains: [], calcHours: null, calcRate: null, calcYearly: null, calcTouched: false };
  var draftDirty = false;

  function loadState() {
    try {
      var saved = JSON.parse(sessionStorage.getItem('ct-meeting') || '{}');
      if (saved.pains) state.pains = saved.pains;
      if (saved.calcHours) state.calcHours = saved.calcHours;
      if (saved.calcRate) state.calcRate = saved.calcRate;
      if (saved.calcYearly) state.calcYearly = saved.calcYearly;
      state.calcTouched = !!saved.calcTouched;
    } catch (e) { /* fresh state */ }
  }
  function saveState() {
    try { sessionStorage.setItem('ct-meeting', JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function data() { return window.Role.data(); }
  function peso(n) { return '₱' + Math.round(n).toLocaleString(); }

  /* ---------- Hero picker ---------- */

  function wirePicker() {
    var cards = document.querySelectorAll('[data-role-pick]');
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        card.addEventListener('click', function (e) {
          e.preventDefault();
          window.Role.set(card.getAttribute('data-role-pick'));
          revealHeadline();
        });
      })(cards[i]);
    }
    var skip = document.getElementById('picker-skip');
    if (skip) {
      skip.addEventListener('click', function (e) {
        e.preventDefault();
        document.documentElement.classList.add('role-skipped');
        var next = document.getElementById('pains');
        if (next) next.scrollIntoView(prefersReduced ? {} : { behavior: 'smooth' });
      });
    }
    var change = document.getElementById('picker-change');
    if (change) {
      change.addEventListener('click', function (e) {
        e.preventDefault();
        window.Role.set(null);
        document.documentElement.classList.remove('role-skipped');
      });
    }
  }

  function renderPicker() {
    var r = window.Role.get();
    var ask = document.getElementById('picker-ask');
    var confirmed = document.getElementById('picker-confirmed');
    if (!ask || !confirmed) return;
    ask.hidden = !!r;
    confirmed.hidden = !r;
    var cards = document.querySelectorAll('[data-role-pick]');
    for (var i = 0; i < cards.length; i++) {
      cards[i].setAttribute('aria-pressed', String(cards[i].getAttribute('data-role-pick') === r));
    }
  }

  /* Word-by-word reveal of the personalized headline (skipped under reduced motion) */
  function revealHeadline() {
    if (prefersReduced) return;
    var h = document.getElementById('hero-headline');
    if (!h) return;
    var words = h.textContent.split(' ');
    h.textContent = '';
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'word-in';
      span.style.animationDelay = (i * 0.07) + 's';
      span.textContent = w;
      h.appendChild(span);
      h.appendChild(document.createTextNode(' '));
    });
  }

  /* ---------- Pain cards ---------- */

  function renderPains() {
    var host = document.getElementById('pain-cards');
    if (!host) return;
    var pains = data().pains || [];
    // Drop selections that don't exist for this role
    state.pains = state.pains.filter(function (id) {
      return pains.some(function (p) { return p.id === id; });
    });
    host.innerHTML = '';
    pains.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pain-card';
      btn.setAttribute('data-pain', p.id);
      btn.setAttribute('aria-pressed', String(state.pains.indexOf(p.id) !== -1));
      btn.innerHTML =
        '<span class="pain-check" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' +
        '<span class="pain-body"><strong></strong><span class="pain-detail"></span></span>' +
        '<span class="pain-tag" aria-hidden="true">that’s us</span>';
      btn.querySelector('strong').textContent = p.label;
      btn.querySelector('.pain-detail').textContent = p.detail;
      btn.addEventListener('click', function () {
        var idx = state.pains.indexOf(p.id);
        if (idx === -1) state.pains.push(p.id);
        else state.pains.splice(idx, 1);
        btn.setAttribute('aria-pressed', String(idx === -1));
        saveState();
        renderPainCount();
        renderDraft();
      });
      host.appendChild(btn);
    });
    renderPainCount();
  }

  function renderPainCount() {
    var out = document.getElementById('pain-count');
    if (!out) return;
    var n = state.pains.length;
    out.textContent = n === 0
      ? 'Tap any card that sounds like your week.'
      : (n === 1 ? '1 thing noted — it’ll be in your message below.'
                 : n + ' things noted — they’ll be in your message below.');
  }

  /* ---------- Calculator ---------- */

  function wireCalc() {
    var hours = document.getElementById('calc-hours');
    var rate = document.getElementById('calc-rate');
    if (!hours || !rate) return;
    function update(animate) {
      var h = +hours.value, rt = +rate.value;
      state.calcHours = h;
      state.calcRate = rt;
      state.calcYearly = h * rt * 52;
      document.getElementById('calc-hours-out').textContent = h + (h === 1 ? ' hour' : ' hours') + ' / week';
      document.getElementById('calc-rate-out').textContent = peso(rt) + ' / hour';
      var out = document.getElementById('calc-total');
      if (animate && !prefersReduced) animateNumber(out, state.calcYearly);
      else out.textContent = peso(state.calcYearly);
      saveState();
      renderDraft();
    }
    hours.addEventListener('input', function () { state.calcTouched = true; update(false); });
    rate.addEventListener('input', function () { state.calcTouched = true; update(false); });
    // Re-seed this role's defaults on every switch until the visitor
    // drags a slider themselves — then their numbers win.
    document.addEventListener('rolechange', function () {
      if (!state.calcTouched) {
        var c = data().calc || {};
        hours.value = c.hoursDefault || 8;
        rate.value = c.rateDefault || 300;
      }
      update(true);
    });
    var c = data().calc || {};
    hours.value = state.calcTouched ? (state.calcHours || c.hoursDefault || 8) : (c.hoursDefault || 8);
    rate.value = state.calcTouched ? (state.calcRate || c.rateDefault || 300) : (c.rateDefault || 300);
    update(false);
  }

  var numAnim = null;
  function animateNumber(el, target) {
    if (numAnim) cancelAnimationFrame(numAnim);
    var from = parseInt((el.textContent || '0').replace(/[^\d]/g, ''), 10) || 0;
    var start = null, duration = 700;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = peso(from + (target - from) * eased);
      if (p < 1) numAnim = requestAnimationFrame(step);
    }
    numAnim = requestAnimationFrame(step);
  }

  /* ---------- Proof (case study swap) ---------- */

  function renderProof() {
    var proof = data().proof;
    if (!proof) return;
    var img = document.getElementById('proof-img');
    if (img && img.getAttribute('src') !== proof.img) {
      img.setAttribute('src', proof.img);
      img.setAttribute('alt', proof.imgAlt);
    }
    var tags = document.getElementById('proof-tags');
    if (tags) {
      tags.innerHTML = '';
      (proof.tags || []).forEach(function (t) {
        var s = document.createElement('span');
        s.className = 'proof-tag';
        s.textContent = t;
        tags.appendChild(s);
      });
    }
    var link = document.getElementById('proof-link');
    if (link) {
      link.setAttribute('href', proof.link);
      link.textContent = proof.linkLabel;
      if (/^https?:/.test(proof.link)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      else { link.removeAttribute('target'); link.removeAttribute('rel'); }
    }
  }

  function wireCompare() {
    var range = document.getElementById('compare-range');
    var after = document.getElementById('compare-after');
    if (!range || !after) return;
    function update() {
      after.style.clipPath = 'inset(0 0 0 ' + range.value + '%)';
      document.getElementById('compare-divider').style.left = range.value + '%';
    }
    range.addEventListener('input', update);
    update();
  }

  /* ---------- Timeline accordion ---------- */

  function wireTimeline() {
    var steps = document.querySelectorAll('.tl-step');
    for (var i = 0; i < steps.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var open = btn.getAttribute('aria-expanded') === 'true';
          for (var j = 0; j < steps.length; j++) steps[j].setAttribute('aria-expanded', 'false');
          btn.setAttribute('aria-expanded', String(!open));
        });
      })(steps[i]);
    }
  }

  /* ---------- Contact finale ---------- */

  function renderDraft() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    window.Role.applyHiddenFields(form, window.Role.get());
    var msg = form.querySelector('textarea[name="message"]');
    if (!msg || draftDirty) return;
    msg.value = window.Role.buildDraft(window.Role.get());
    renderSummary();
  }

  function renderSummary() {
    var host = document.getElementById('cta-summary');
    if (!host) return;
    var r = window.Role.get();
    var d = data();
    var items = [];
    if (r) items.push('You run a <strong>' + d.label.toLowerCase() + '</strong>');
    if (state.pains.length) items.push('<strong>' + state.pains.length + '</strong> ' + (state.pains.length === 1 ? 'challenge' : 'challenges') + ' sounded familiar');
    if (state.calcYearly) items.push('Manual admin estimate: <strong>' + peso(state.calcYearly) + '/year</strong>');
    if (!items.length) {
      host.innerHTML = '';
      host.hidden = true;
      return;
    }
    host.hidden = false;
    host.innerHTML = '<div class="cta-summary-label">What you told us on this page</div>' +
      items.map(function (t) { return '<div class="cta-summary-item"><span aria-hidden="true">✓</span> ' + t + '</div>'; }).join('');
  }

  function wireContact() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var msg = form.querySelector('textarea[name="message"]');
    if (msg) msg.addEventListener('input', function () { draftDirty = true; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = document.getElementById('contact-msg');
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          out.textContent = 'Message sent! A real person replies within one business day.';
          form.reset();
          draftDirty = false;
        } else {
          out.textContent = 'Something went wrong. Please email us directly at customers@cortanatechsolutions.com.';
        }
      }).catch(function () {
        out.textContent = 'Something went wrong. Please email us directly at customers@cortanatechsolutions.com.';
      });
    });
  }

  /* ---------- Boot ---------- */

  function renderAll() {
    renderPicker();
    renderPains();
    renderProof();
    renderDraft();
    renderSummary();
  }

  function init() {
    if (!window.MEETING_ROLES || !window.Role) return;
    document.documentElement.classList.add('js-meeting');
    loadState();
    wirePicker();
    wireCalc();
    wireCompare();
    wireTimeline();
    wireContact();
    if (window.ChatDemo) {
      var chatHost = document.getElementById('chat-demo');
      if (chatHost) window.ChatDemo.mount(chatHost);
    }
    renderAll();
    document.addEventListener('rolechange', renderAll);
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { loadState(); renderAll(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
