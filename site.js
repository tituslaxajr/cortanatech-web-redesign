/*
 * site.js — shared behaviour driven by site-config.js:
 *  - loads Google Analytics 4 when CT_CONFIG.gaId is set
 *  - tracks the actions that matter: "Book a free call" clicks, finished
 *    project briefs and contact messages (generate_lead), email/chat clicks
 *  - reveals booking, Messenger and Viber links only once they are configured
 *    ([data-show="booking|messenger|viber"] wrappers, [data-link="…"] anchors)
 * Pages fire `ct:lead` on document when a form is sent successfully.
 */
(function () {
  var C = window.CT_CONFIG || {};
  var links = {
    booking: C.bookingUrl || '',
    messenger: C.messengerUrl || '',
    viber: C.viberNumber ? 'viber://chat?number=%2B' + String(C.viberNumber).replace(/\D/g, '') : ''
  };

  if (/^G-[A-Z0-9]+$/.test(C.gaId || '')) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.gaId;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', C.gaId);
  }

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function applyLinks(root) {
    root = root || document;
    Object.keys(links).forEach(function (k) {
      if (!links[k]) return;
      root.querySelectorAll('[data-show="' + k + '"]').forEach(function (el) { el.hidden = false; });
      root.querySelectorAll('[data-link="' + k + '"]').forEach(function (a) {
        a.href = links[k];
        a.hidden = false;
        if (k !== 'viber') { a.target = '_blank'; a.rel = 'noopener'; }
      });
    });
  }

  // Footer gets a Messenger link once one is configured
  if (links.messenger) {
    document.querySelectorAll('.site-footer nav').forEach(function (nav) {
      var a = document.createElement('a');
      a.setAttribute('data-link', 'messenger');
      a.textContent = 'Messenger';
      nav.appendChild(a);
    });
  }
  applyLinks(document);

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var label = (a.textContent || '').trim().slice(0, 60);
    if (/project-brief\.html/.test(href)) track('book_call_click', { link_text: label });
    else if (a.dataset.link === 'booking') track('booking_click', { link_text: label });
    else if (a.dataset.link === 'messenger' || a.dataset.link === 'viber') track('chat_click', { channel: a.dataset.link });
    else if (/^mailto:/.test(href)) track('email_click');
    else if (/church\.cortanatechsolutions\.com/.test(href)) track('church_assessment_click');
  });

  document.addEventListener('ct:lead', function (e) {
    track('generate_lead', { form: (e.detail && e.detail.form) || 'unknown' });
  });

  window.CT = { track: track, applyLinks: applyLinks };
})();
