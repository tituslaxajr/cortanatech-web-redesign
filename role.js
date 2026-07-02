/*
 * role.js — shared role runtime for every page.
 *
 * Owns the visitor's chosen role ("church" | "school" | "nonprofit" | "smallbiz"):
 *  - persists it in localStorage('ct-role') with an in-memory fallback
 *  - mirrors it as <html data-role="..."> (an inline head snippet on each page
 *    sets this pre-paint; this script keeps it in sync afterwards)
 *  - dispatches a `rolechange` CustomEvent on document when it changes
 *  - swaps the text of every [data-role-slot="dot.path"] element from
 *    window.MEETING_ROLES, falling back to _default
 *  - injects a "Viewing as" switcher chip into the nav once a role exists
 *  - prefills the contact form on pages meeting.js doesn't manage
 *
 * Requires meeting-data.js. Safe to load on any page.
 */
(function () {
  var KEY = 'ct-role';
  // 'startup' was renamed to 'smallbiz' — migrate stored values from early visitors
  var VALID = ['church', 'school', 'nonprofit', 'smallbiz'];
  try {
    if (localStorage.getItem('ct-role') === 'startup') localStorage.setItem('ct-role', 'smallbiz');
  } catch (e) { /* storage unavailable */ }
  var memoryRole = null; // fallback when storage is unavailable

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return memoryRole; }
  }
  function write(r) {
    memoryRole = r;
    try {
      if (r) localStorage.setItem(KEY, r);
      else localStorage.removeItem(KEY);
    } catch (e) { /* private mode — in-memory only */ }
  }

  function getRole() {
    var r = read();
    return VALID.indexOf(r) !== -1 ? r : null;
  }

  function roleData(r) {
    var roles = window.MEETING_ROLES || {};
    return (r && roles[r]) || roles._default || {};
  }

  function resolve(obj, path) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function applySlots() {
    var r = getRole();
    var data = roleData(r);
    var fallback = roleData(null);
    var els = document.querySelectorAll('[data-role-slot]');
    for (var i = 0; i < els.length; i++) {
      var path = els[i].getAttribute('data-role-slot');
      var val = resolve(data, path);
      if (val === undefined) val = resolve(fallback, path);
      if (typeof val === 'string') els[i].textContent = val;
    }
  }

  function announce(text) {
    var live = document.getElementById('role-live');
    if (!live) {
      live = document.createElement('div');
      live.id = 'role-live';
      live.setAttribute('aria-live', 'polite');
      live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;';
      document.body.appendChild(live);
    }
    live.textContent = text;
  }

  function setRole(r, opts) {
    if (VALID.indexOf(r) === -1) r = null;
    write(r);
    if (r) document.documentElement.setAttribute('data-role', r);
    else document.documentElement.removeAttribute('data-role');
    applySlots();
    renderChip();
    if (!opts || !opts.silent) {
      var label = r ? roleData(r).label : 'all organizations';
      announce('Now viewing the site as a ' + (r ? label.toLowerCase() : '') + (r ? '' : 'general visitor') + '.');
    }
    try {
      document.dispatchEvent(new CustomEvent('rolechange', { detail: { role: r } }));
    } catch (e) { /* very old browsers: no CustomEvent constructor */ }
  }

  /* ---------- "Viewing as" nav chip ---------- */

  function chipHTML(r) {
    var label = roleData(r).label || 'Organization';
    return 'Viewing as: <strong>' + label + '</strong> <svg viewBox="0 0 12 8" width="10" height="7" aria-hidden="true" style="margin-left:2px;"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
  }

  function buildMenu(chip) {
    var menu = document.createElement('div');
    menu.className = 'role-chip-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', 'View the site as');
    var current = getRole();
    var items = VALID.concat(['']); // '' = everyone
    items.forEach(function (r) {
      var opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'role-chip-option';
      opt.setAttribute('role', 'option');
      opt.setAttribute('aria-selected', String((r || null) === current));
      opt.textContent = r ? roleData(r).label : 'All organizations';
      opt.addEventListener('click', function () {
        closeMenus();
        setRole(r || null);
      });
      menu.appendChild(opt);
    });
    return menu;
  }

  function closeMenus() {
    var open = document.querySelectorAll('.role-chip-menu');
    for (var i = 0; i < open.length; i++) open[i].parentNode.removeChild(open[i]);
    var chips = document.querySelectorAll('.role-chip');
    for (var j = 0; j < chips.length; j++) chips[j].setAttribute('aria-expanded', 'false');
  }

  function renderChip() {
    var r = getRole();
    // Remove existing chips, then re-add if a role is set
    var olds = document.querySelectorAll('.role-chip-wrap');
    for (var i = 0; i < olds.length; i++) olds[i].parentNode.removeChild(olds[i]);
    if (!r) return;

    var spots = [];
    var desktop = document.querySelector('.desktop-nav');
    var mobile = document.querySelector('.mobile-nav');
    if (desktop) spots.push({ host: desktop, first: true });
    if (mobile) spots.push({ host: mobile, first: false });

    spots.forEach(function (spot) {
      var wrap = document.createElement('div');
      wrap.className = 'role-chip-wrap';
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'role-chip' + (document.querySelector('.home-nav .desktop-nav') === spot.host ? ' role-chip-dark' : '');
      chip.setAttribute('aria-haspopup', 'listbox');
      chip.setAttribute('aria-expanded', 'false');
      chip.innerHTML = chipHTML(r);
      chip.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = chip.getAttribute('aria-expanded') === 'true';
        closeMenus();
        if (!isOpen) {
          chip.setAttribute('aria-expanded', 'true');
          wrap.appendChild(buildMenu(chip));
        }
      });
      wrap.appendChild(chip);
      if (spot.first && spot.host.firstChild) spot.host.insertBefore(wrap, spot.host.firstChild);
      else spot.host.appendChild(wrap);
    });
  }

  document.addEventListener('click', closeMenus);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenus();
  });

  /* ---------- Contact form prefill (pages without meeting.js) ---------- */

  function readMeetingState() {
    try { return JSON.parse(sessionStorage.getItem('ct-meeting') || '{}'); } catch (e) { return {}; }
  }

  function buildDraft(r) {
    var data = roleData(r);
    var state = readMeetingState();
    var lines = [(data.cta && data.cta.opener) || 'Hi CortanaTech —'];
    if (state.pains && state.pains.length && data.pains) {
      var labels = [];
      data.pains.forEach(function (p) {
        if (state.pains.indexOf(p.id) !== -1) labels.push(p.label.charAt(0).toLowerCase() + p.label.slice(1));
      });
      if (labels.length) lines.push('A few things on your site sounded familiar: ' + labels.join('; ') + '.');
    }
    if (state.calcYearly) {
      lines.push('Rough estimate from your calculator: manual admin may be costing us around ₱' + Number(state.calcYearly).toLocaleString() + ' a year.');
    }
    lines.push('We’d like to talk about what you’d recommend.');
    return lines.join('\n\n');
  }

  function ensureHidden(form, name, value) {
    var el = form.querySelector('input[type="hidden"][name="' + name + '"]');
    if (!value) { if (el) el.parentNode.removeChild(el); return; }
    if (!el) {
      el = document.createElement('input');
      el.type = 'hidden';
      el.name = name;
      form.appendChild(el);
    }
    el.value = value;
  }

  function applyHiddenFields(form, r) {
    var data = roleData(r);
    var state = readMeetingState();
    var painLabels = [];
    if (state.pains && data.pains) {
      data.pains.forEach(function (p) {
        if (state.pains.indexOf(p.id) !== -1) painLabels.push(p.label);
      });
    }
    ensureHidden(form, 'role', r ? data.label : '');
    ensureHidden(form, 'pains', painLabels.join(', '));
    ensureHidden(form, 'estimated_cost', state.calcYearly ? '₱' + Number(state.calcYearly).toLocaleString() + '/year' : '');
    ensureHidden(form, '_subject', (data.cta && data.cta.subject) || 'Website inquiry');
  }

  function prefillContact() {
    // meeting.js owns the homepage finale; skip when it's present.
    if (document.querySelector('[data-meeting-home]')) return;
    var form = document.getElementById('contact-form');
    if (!form) return;
    var r = getRole();
    applyHiddenFields(form, r);
    if (!r) return;
    var msg = form.querySelector('textarea[name="message"]');
    if (msg && !msg.value && !msg.dataset.dirty) {
      msg.value = buildDraft(r);
    }
    if (msg && !msg.dataset.wired) {
      msg.dataset.wired = '1';
      msg.addEventListener('input', function () { msg.dataset.dirty = '1'; });
    }
    var svc = form.querySelector('select[name="service"]');
    if (svc && !svc.value) {
      var state = readMeetingState();
      // Best-guess: chatbot pain → chatbot; data pain → custom app; default website
      if (state.pains && state.pains.indexOf('data') !== -1) svc.selectedIndex = 4;
      else if (state.pains && state.pains.indexOf('questions') !== -1) svc.selectedIndex = 3;
      else svc.selectedIndex = 1;
    }
  }

  /* ---------- Public API + boot ---------- */

  window.Role = {
    get: getRole,
    set: setRole,
    data: function () { return roleData(getRole()); },
    dataFor: roleData,
    applySlots: applySlots,
    buildDraft: buildDraft,
    applyHiddenFields: applyHiddenFields,
    meetingState: readMeetingState
  };

  function syncAll() {
    var r = getRole();
    if (r) document.documentElement.setAttribute('data-role', r);
    applySlots();
    renderChip();
    prefillContact();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAll);
  } else {
    syncAll();
  }
  // bfcache restore: re-sync UI from storage
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) syncAll();
  });
  document.addEventListener('rolechange', prefillContact);
})();
