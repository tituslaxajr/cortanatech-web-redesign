/*
 * chat-demo.js — scripted, dependency-free chat widget.
 *
 * Plays a canned decision tree from MEETING_ROLES[role].chat: the visitor
 * replies by tapping option chips (no free text, so no dead ends). Bot
 * messages appear after a short typing indicator, skipped entirely under
 * prefers-reduced-motion.
 *
 * Usage: ChatDemo.mount(containerEl) — reads the current role via window.Role
 * and re-seeds itself on `rolechange`.
 */
(function () {
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function mount(container) {
    var log, chipRow, script, busy = false;

    function scrollLog() { log.scrollTop = log.scrollHeight; }

    function addMsg(text, who) {
      var row = el('div', 'chat-row chat-row-' + who);
      var bubble = el('div', 'chat-bubble chat-bubble-' + who, text);
      row.appendChild(bubble);
      log.appendChild(row);
      scrollLog();
      return row;
    }

    function addTyping() {
      var row = el('div', 'chat-row chat-row-bot chat-typing-row');
      var bubble = el('div', 'chat-bubble chat-bubble-bot chat-typing');
      bubble.setAttribute('aria-hidden', 'true');
      bubble.appendChild(el('i')); bubble.appendChild(el('i')); bubble.appendChild(el('i'));
      row.appendChild(bubble);
      log.appendChild(row);
      scrollLog();
      return row;
    }

    function botSay(messages, done) {
      var i = 0;
      function next() {
        if (i >= messages.length) { if (done) done(); return; }
        var text = messages[i++];
        if (prefersReduced) { addMsg(text, 'bot'); next(); return; }
        var typing = addTyping();
        setTimeout(function () {
          log.removeChild(typing);
          addMsg(text, 'bot');
          setTimeout(next, 220);
        }, Math.min(500 + text.length * 6, 1400));
      }
      next();
    }

    function showOptions(options) {
      chipRow.innerHTML = '';
      options.forEach(function (opt) {
        var chip = el('button', 'chat-chip', opt.label);
        chip.type = 'button';
        chip.addEventListener('click', function () { choose(opt); });
        chipRow.appendChild(chip);
      });
      busy = false;
    }

    function choose(opt) {
      if (busy) return;
      if (opt.next === '#contact') {
        var target = document.getElementById('contact');
        if (target) target.scrollIntoView(prefersReduced ? {} : { behavior: 'smooth' });
        else window.location.href = 'contact.html';
        return;
      }
      busy = true;
      chipRow.innerHTML = '';
      if (opt.next === 'start') { seed(true); return; }
      addMsg(opt.label, 'user');
      var node = script.nodes[opt.next];
      if (!node) { busy = false; return; }
      botSay(node.bot || [], function () { showOptions(node.options || []); });
    }

    function seed(isRestart) {
      var data = (window.Role && window.Role.data()) || {};
      script = data.chat;
      if (!script) return;
      log.innerHTML = '';
      chipRow.innerHTML = '';
      busy = true;
      botSay([script.greeting], function () {
        showOptions((script.nodes.start && script.nodes.start.options) || []);
      });
    }

    // Build shell
    container.innerHTML = '';
    var head = el('div', 'chat-head');
    var dot = el('span', 'chat-status-dot');
    dot.setAttribute('aria-hidden', 'true');
    head.appendChild(dot);
    head.appendChild(el('span', 'chat-head-label', 'Demo assistant — online'));
    log = el('div', 'chat-log');
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');
    log.setAttribute('aria-label', 'Chat conversation');
    chipRow = el('div', 'chat-chips');
    container.appendChild(head);
    container.appendChild(log);
    container.appendChild(chipRow);

    seed();
    document.addEventListener('rolechange', function () { seed(true); });
  }

  window.ChatDemo = { mount: mount };
})();
