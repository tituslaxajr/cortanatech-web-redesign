/*
 * brief.js — the self-serve Project Brief wizard (project-brief.html).
 *
 * Structure is deliberately diagnostic rather than solution-first:
 *   1. who the client serves      -> audience
 *   2. what is not working today  -> problem + current workaround
 *   3. what they think would fix it + how sure they are
 *   4. what success looks like
 *   ...then scope, brand, budget, contact.
 *
 * Every problem option carries `need` tags and every assumed-solution option
 * carries `gives` tags. Comparing the two sets produces a want-vs-need read:
 * a soft "what we'll explore" note for the client, and a blunter internal
 * assessment stapled to the emailed brief.
 *
 * Long option lists are kept scannable three ways:
 *   - `groups` chunks a list into small labelled clusters (~3-5 each)
 *   - `for:` tags hide options that cannot apply to the org type picked in
 *     step 1, behind a "Show all options" escape hatch
 *   - `t:'collapse'` puts secondary questions behind a disclosure
 * A `t:'rank'` field then asks which of the chosen problems hurts most, so a
 * client who ticks ten boxes still hands us a priority.
 *
 * All steps render up front into one <form> and are toggled with [hidden], so
 * FormData() always sees every answer and nothing is lost on navigation.
 * Answers autosave to localStorage; inapplicable steps and filtered-out
 * options are disabled so they never submit.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://formspree.io/f/xkolqjkj';
  var STORE = 'ct-brief-v1';
  var CONTACT_EMAIL = 'customers@cortanatechsolutions.com';

  /* Org-type codes used by `for:` tags. '*' means show everything. */
  var ORG_CODE = {
    'Church or ministry': 'c',
    'School or academy': 's',
    'Nonprofit or foundation': 'n',
    'Small business': 'b',
    'Startup': 't',
    'Something else': '*'
  };

  /* ------------------------------------------------------------------ *
   * Capability vocabulary — shared by problems, solutions and the read. *
   * ------------------------------------------------------------------ */
  var CAP = {
    site:      'a proper website to point people to',
    seo:       'being findable on Google',
    redesign:  'rebuilding the current site to work on phones',
    chatbot:   'a chatbot to handle the repeated questions',
    inquiry:   'one inbox for inquiries instead of scattered DMs',
    forms:     'online forms for enrollment / registration',
    booking:   'online booking so appointments stop being a back-and-forth',
    payments:  'accepting payments online',
    giving:    'online giving',
    receipts:  'automatic receipts and a report of where the money went',
    db:        'an internal system to replace the manual paperwork',
    email:     'professional email on your own domain',
    newsletter:'a way to email your members or customers as a group',
    members:   'a members-only area',
    content:   'writing and photos for the site'
  };

  /* ---------------- Step 2: what is not working ----------------
   * Chunked into four clusters. `need` drives the want-vs-need read;
   * `for` hides options that cannot apply to the chosen org type.     */
  var PROBLEM_GROUPS = [
    { label: 'Being found, and looking credible', opts: [
      { v: "People can't find us when they search online",        need: ['seo', 'site'] },
      { v: 'We look less professional online than we really are',  need: ['site'] },
      { v: 'Our site is old, or breaks on phones',                 need: ['redesign'] },
      { v: 'Everything we have is buried in Facebook posts',       need: ['site'] },
      { v: "We don't have the words or photos to show what we do",  need: ['content'] }
    ] },
    { label: 'Answering people, and catching enquiries', opts: [
      { v: 'We answer the same questions over and over',           need: ['chatbot'] },
      { v: 'Inquiries get lost in Messenger and DMs',              need: ['inquiry', 'chatbot'] }
    ] },
    { label: 'Sign-ups, bookings and money', opts: [
      { v: 'Enrollment or registration means long lines on-site',  need: ['forms'],    for: ['c', 's', 'n'] },
      { v: 'Booking appointments is endless back-and-forth',        need: ['booking'],  for: ['b', 't', 'c'] },
      { v: "Giving or donating is hard for people who want to",     need: ['giving', 'payments'], for: ['c', 'n'] },
      { v: "We can't show donors where their money went",           need: ['receipts'], for: ['c', 'n'] },
      { v: "We can't accept payments online",                       need: ['payments'], for: ['b', 't', 's'] }
    ] },
    { label: 'Admin, records and reaching people', opts: [
      { v: 'Staff lose hours on manual paperwork and spreadsheets', need: ['db'] },
      { v: 'Our email address looks unprofessional',                need: ['email'] },
      { v: 'We have no way to reach everyone at once',              need: ['newsletter'] },
      { v: 'Members have nowhere private to log in',                need: ['members'], for: ['c', 's', 'n'] }
    ] }
  ];

  /* ---------------- Step 3: what they think would fix it ---------------- */
  var SOLUTION_GROUPS = [
    { label: 'A website', opts: [
      { v: 'A brand-new website',            gives: ['site', 'seo', 'content'] },
      { v: 'A redesign of our current site', gives: ['redesign', 'site', 'seo'] }
    ] },
    { label: 'Something that automates work', opts: [
      { v: 'A chatbot for our page',         gives: ['chatbot', 'inquiry'] },
      { v: 'Online forms or registration',   gives: ['forms', 'inquiry'] },
      { v: 'Online booking or appointments', gives: ['booking'] },
      { v: 'Online giving or payments',      gives: ['giving', 'payments', 'receipts'] },
      { v: 'A database or internal system',  gives: ['db'] },
      { v: 'A mobile app',                   gives: ['mobileapp'] }
    ] },
    { label: 'Support around it', opts: [
      { v: 'Professional email setup',       gives: ['email', 'newsletter'] },
      { v: 'Help writing content and taking photos', gives: ['content'] },
      { v: "Honestly not sure — that's why we're asking", gives: ['unsure'] }
    ] }
  ];

  /* Flatten a grouped list for lookups. */
  function flatOpts(groups) {
    var out = [];
    groups.forEach(function (g) { g.opts.forEach(function (o) { out.push(o); }); });
    return out;
  }
  var PROBLEMS = flatOpts(PROBLEM_GROUPS);
  var SOLUTIONS = flatOpts(SOLUTION_GROUPS);

  /* -------------------------------- Steps -------------------------------- */
  var STEPS = [

    { id: 'who',
      eyebrow: 'First things first',
      title: 'Who are you trying to reach?',
      sub: 'Not us — the people your organization exists for. This shapes every decision that follows, so it comes before anything about websites.',
      fields: [
        { t: 'radio', k: 'orgtype', label: 'What kind of organization are you?', req: true, cols: 2,
          hint: 'This trims the rest of the questions down to what actually applies to you.',
          opts: ['Church or ministry', 'School or academy', 'Nonprofit or foundation', 'Small business', 'Startup', 'Something else'] },
        { t: 'chips', k: 'audience', label: 'And who are you serving?', req: true,
          hint: 'Pick as many as apply.',
          groups: [
            { label: 'People you already have', opts: [
              { v: 'Our own members or congregation', for: ['c', 'n'] },
              { v: 'Parents', for: ['s', 'c'] },
              { v: 'Students', for: ['s', 'c'] },
              { v: 'Volunteers', for: ['c', 'n'] },
              { v: 'Our own staff and team' }
            ] },
            { label: 'People you want to reach', opts: [
              { v: 'Newcomers and visitors' },
              { v: 'Donors and supporters', for: ['c', 'n'] },
              { v: 'Walk-in customers nearby', for: ['b', 't'] },
              { v: 'Customers across the country', for: ['b', 't'] },
              { v: 'Overseas Filipinos / OFWs' }
            ] },
            { label: 'Organizations', opts: [
              { v: 'Other businesses' },
              { v: 'Partner organizations' }
            ] }
          ],
          other: 'Someone else — who?' }
      ] },

    { id: 'problem',
      eyebrow: 'The real question',
      title: "What isn't working right now?",
      sub: "This is the most useful thing you can tell us. Don't worry about solutions yet — just what's frustrating.",
      fields: [
        { t: 'chips', k: 'problems', label: "What's the trouble?", req: true,
          hint: 'Tick whatever stings. Most people pick three or four.',
          count: true, groups: PROBLEM_GROUPS,
          other: 'Something else — what?' },
        { t: 'rank', k: 'worst', from: 'problems',
          label: 'And which of those hurts the most?',
          hint: 'If you could only fix one thing this year, which would it be?' }
      ] },

    { id: 'coping',
      eyebrow: 'Today',
      title: 'How are you handling it now?',
      sub: "The workaround usually tells us more than the problem does — it shows us what this is really costing you.",
      fields: [
        { t: 'chips', k: 'current', label: 'What happens at the moment?',
          opts: ['By hand, on paper', 'Facebook page only', 'Messenger or Viber chats', 'Spreadsheets',
                 'Phone calls and texts', 'People have to come in person', 'A staff member does it manually',
                 "We're not — it just doesn't get done"] },
        { t: 'area', k: 'problem_words', label: 'Anything you want to say in your own words?', rows: 3,
          hint: 'Optional, but the single most useful box on this form. Even one sentence helps.',
          ph: "e.g. Parents call the office all day asking the same enrollment questions and we can't keep up." }
      ] },

    { id: 'idea',
      eyebrow: 'Your read on it',
      title: 'What do you think would fix it?',
      sub: "We ask this third on purpose. Sometimes the answer you have in mind is exactly right — and sometimes there's a simpler or cheaper way to get the same result. We'd rather find that out now than after you've paid for it.",
      fields: [
        { t: 'chips', k: 'solutions', label: 'What are you picturing?', req: true,
          groups: SOLUTION_GROUPS, other: 'Something else — what?' },
        { t: 'radio', k: 'certainty', label: 'How settled is that decision?',
          hint: "Be honest — there's no wrong answer, and it changes how we talk to you.",
          opts: [
            { v: "It's decided. We know what we want built.", d: "We'll scope exactly that and stay out of your way." },
            { v: "Fairly sure, but open to a better idea.",    d: "We'll flag it if we see a shortcut." },
            { v: "Honestly it's a guess. Tell us what to do.",  d: "We'll come back with a recommendation and why." }
          ] },
        { t: 'area', k: 'idea_why', label: 'Why that, in particular?', rows: 2,
          hint: 'Optional.',
          ph: 'e.g. A friend said we need a website, or we saw one we liked.' }
      ] },

    { id: 'success',
      eyebrow: 'The finish line',
      title: 'What would make this worth it?',
      sub: "If we do this well, what changes for you six months from now?",
      fields: [
        { t: 'chips', k: 'success', label: 'What does a win look like?', req: true,
          groups: [
            { label: 'More of something', opts: [
              { v: 'More inquiries coming in' },
              { v: 'More people giving or donating', for: ['c', 'n'] },
              { v: 'More enrollments or sign-ups', for: ['s', 'c', 'n'] },
              { v: 'More sales', for: ['b', 't'] },
              { v: 'Reaching people outside our area' }
            ] },
            { label: 'Less of something', opts: [
              { v: 'Fewer repetitive questions to answer' },
              { v: 'Hours of staff time saved' },
              { v: 'One place to send people instead of explaining' }
            ] },
            { label: 'Standing', opts: [
              { v: 'Looking credible to people who check us out' },
              { v: 'Members staying engaged', for: ['c', 's', 'n'] }
            ] }
          ],
          other: 'Something else — what?' },
        { t: 'chips', k: 'action', label: 'And what should a visitor DO before they leave?',
          hint: 'The one thing you most want to happen.',
          opts: [
            { v: 'Send us an inquiry' },
            { v: 'Give or donate', for: ['c', 'n'] },
            { v: 'Book an appointment', for: ['b', 't', 'c'] },
            { v: 'Enroll or register', for: ['s', 'c', 'n'] },
            { v: 'Buy something', for: ['b', 't'] },
            { v: 'Visit us in person' },
            { v: 'Follow our social pages' },
            { v: 'Join our mailing list' },
            { v: 'Watch or listen to something', for: ['c', 'n'] },
            { v: 'Just understand who we are' }
          ] },
        { t: 'text', k: 'measure', label: "How would you know it worked?",
          hint: 'Optional. A number or a feeling — either is fine.',
          ph: 'e.g. 10 enrollment inquiries a month instead of 2' }
      ] },

    { id: 'org',
      eyebrow: 'Background',
      title: 'Tell us where to look you up',
      sub: "One link saves you writing three paragraphs. If you have a Facebook page or an existing site, we'll read it ourselves — your story, your services, your tone.",
      fields: [
        { t: 'text', k: 'org', label: "Your organization's name", req: true, ph: 'e.g. Grace Community Church' },
        { t: 'text', k: 'based', label: 'Where are you based?', half: true, ph: 'e.g. Cabanatuan, Nueva Ecija' },
        { t: 'text', k: 'links', label: 'Website or Facebook page', half: true, ph: 'Paste any link — or type "none"' },
        { t: 'area', k: 'about', label: 'Anything a link would miss?', rows: 3,
          hint: "Optional — skip it if your page already says this. Mission, what makes you different, something you're proud of.",
          ph: 'Optional.' }
      ] },

    { id: 'scope',
      eyebrow: 'Scope',
      title: 'What should it include?',
      sub: "A rough guess is fine — this is a starting point, not a contract. We'll tell you what you actually need.",
      optional: true,
      when: function (d) { return !isAppOnly(d); },
      fields: [
        { t: 'chips', k: 'pages', label: 'Pages and sections', count: true,
          groups: [
            { label: 'The basics', opts: [
              { v: 'Home' }, { v: 'About us' }, { v: 'Contact' }
            ] },
            { label: 'What you offer', opts: [
              { v: 'Services or programs' }, { v: 'FAQ' }, { v: 'Downloads and forms' }
            ] },
            { label: 'Things you post', opts: [
              { v: 'News or blog' }, { v: 'Photo gallery' }, { v: 'Events or calendar' },
              { v: 'Staff or team' }, { v: 'Sermons or media', for: ['c'] }
            ] },
            { label: 'Where people act', opts: [
              { v: 'Give or donate', for: ['c', 'n'] },
              { v: 'Online shop', for: ['b', 't'] },
              { v: 'Enrollment or admissions', for: ['s', 'c'] },
              { v: 'Members-only area', for: ['c', 's', 'n'] }
            ] }
          ],
          other: 'Another page — what?' },
        { t: 'collapse', k: 'features_open', label: 'Should it do anything beyond the pages above?',
          hint: 'Forms, payments, bookings, a chatbot — open this if any of that matters.',
          fields: [
        { t: 'chips', k: 'features', label: 'Things it should be able to do',
          groups: [
            { label: 'Taking things in', opts: [
              { v: 'Collect inquiries' }, { v: 'Take bookings' },
              { v: 'Take registrations' }, { v: 'Newsletter sign-up' },
              { v: 'Accept payments or giving' }
            ] },
            { label: 'Doing work for you', opts: [
              { v: 'Send automatic email replies' }, { v: 'Chatbot on the page' },
              { v: 'Reports or analytics' }
            ] },
            { label: 'Extras', opts: [
              { v: 'Searchable directory' }, { v: 'Multiple languages' },
              { v: 'Live stream embeds', for: ['c'] }, { v: 'Staff logins' }
            ] }
          ] }
          ] }
      ] },

    { id: 'feel',
      eyebrow: 'Impression',
      title: 'How should it come across?',
      sub: "Two questions we always ask: what should people know about you, and how should they feel.",
      optional: true,
      fields: [
        { t: 'chips', k: 'know', label: 'What should people know about you?',
          opts: ['That we’re established and trustworthy', 'That we genuinely care',
                 'That we’re professional and capable', 'That we’re affordable and fair',
                 'That we’re rooted in this community', 'What we believe and stand for'] },
        { t: 'chips', k: 'feelings', label: 'And how should they feel?',
          opts: ['Welcome', 'Reassured and confident', 'Inspired', 'At peace',
                 'Taken seriously', 'Like they belong here'] },
        { t: 'collapse', k: 'design_open', label: 'Want to give us colour and style direction?',
          hint: 'Entirely optional — most people leave this to us.',
          fields: [
            { t: 'chips', k: 'style', label: 'Which of these sounds like you?',
              opts: ['Clean and minimal', 'Warm and welcoming', 'Bold and modern',
                     'Traditional and formal', 'Bright and playful', 'Quiet and understated'] },
            { t: 'chips', k: 'colors', label: 'Colour direction', swatches: true,
              hint: "Skip this if you'd rather we matched your logo.",
              opts: [
                { v: 'Blues and white', sw: ['#1C75BC', '#29ABE2', '#FFFFFF'] },
                { v: 'Greens and earth tones', sw: ['#2F7A4E', '#8FB996', '#E8E0CF'] },
                { v: 'Warm neutrals and cream', sw: ['#C9A227', '#EFE6D5', '#8A7357'] },
                { v: 'Bold reds and orange', sw: ['#C0392B', '#E8792B', '#F5E2D0'] },
                { v: 'Purples and violet', sw: ['#5B2C8D', '#9B72CF', '#EDE4F7'] },
                { v: 'Black, white and gold', sw: ['#141414', '#C8A951', '#FFFFFF'] },
                { v: 'Just match our logo', sw: ['#E8E6E6', '#C9C7C7', '#A8A6A6'] }
              ] }
          ] },
        { t: 'area', k: 'refs', label: 'Sites you like', rows: 2,
          hint: "Optional, and honestly one of the most useful things you can give us. Paste any links — they don't have to be in your industry.",
          ph: 'e.g. https://example.org — love how simple their giving page is' }
      ] },

    { id: 'brand',
      eyebrow: 'Materials',
      title: 'What do you already have?',
      sub: "Be straight with us here — it's the difference between a realistic quote and a surprise later.",
      fields: [
        { t: 'radio', k: 'branding', label: 'Do you have a logo and brand materials?', req: true,
          opts: [
            { v: 'Yes — logo, colours, the whole kit' },
            { v: 'Some of it — a logo, but that’s about it' },
            { v: 'No — could you create one for us?' },
            { v: 'No — someone else is handling that' }
          ] },
        { t: 'radio', k: 'content_src', label: 'Who will write the text and provide photos?', req: true,
          opts: [
            { v: 'All of it will come from us', d: "We'll send you a simple list of what to gather." },
            { v: 'Some from us — we need help with the rest', d: 'The most common answer, by far.' },
            { v: 'We need you to handle most of it', d: "We'll quote writing and photo sourcing separately." }
          ] },
        { t: 'text', k: 'assets', label: 'Link to your logo or brand files',
          hint: 'Optional — a Drive or Dropbox link works. Or just email files to ' + CONTACT_EMAIL + ' after you submit and mention your organization name.',
          ph: 'Paste a link, or leave blank' }
      ] },

    { id: 'budget',
      eyebrow: 'Practicalities',
      title: 'Budget and timing',
      sub: "Nobody enjoys this question, so here's why we ask: a range lets us design something you can actually afford, instead of quoting you out of the project. Ranges are fine, and “not sure” is a real answer.",
      fields: [
        { t: 'radio', k: 'budget_build', label: 'Rough budget to build it (one-time)', req: true, cols: 2,
          opts: ['Under ₱20,000', '₱20,000 – 50,000', '₱50,000 – 100,000',
                 '₱100,000 – 250,000', 'Over ₱250,000', 'Not sure — please advise'] },
        { t: 'radio', k: 'budget_run', label: 'Yearly budget to keep it running', cols: 2,
          hint: 'Hosting, domain, security and small updates.',
          opts: ['Under ₱5,000', '₱5,000 – 12,000', '₱12,000 – 25,000',
                 'Over ₱25,000', 'Not sure — please advise'] },
        { t: 'radio', k: 'timeline', label: 'When do you need it live?', req: true, cols: 2,
          opts: ['As soon as possible', 'Within 1 month', 'In 1 – 3 months', 'In 3 – 6 months',
                 'No fixed deadline', 'By a specific date'] },
        { t: 'date', k: 'date', label: 'The date', half: true,
          when: function (d) { return d.timeline === 'By a specific date'; } },
        { t: 'text', k: 'deadline_why', label: "Is something driving that date?",
          hint: 'Optional. An anniversary, enrollment season, a launch, a grant deadline.',
          ph: 'e.g. enrollment opens in June' }
      ] },

    { id: 'contact',
      eyebrow: 'Last step',
      title: 'How do we reach you?',
      sub: "That's everything. Tell us where to send our reply and we'll be in touch within one business day.",
      fields: [
        { t: 'text',  k: 'name',  label: 'Your name', req: true, half: true, ph: 'Juan dela Cruz' },
        { t: 'text',  k: 'role',  label: 'Your role', half: true, ph: 'e.g. Pastor, Principal, Owner' },
        { t: 'email', k: 'email', label: 'Email', req: true, half: true, ph: 'you@example.com' },
        { t: 'tel',   k: 'phone', label: 'Mobile, WhatsApp or Viber', req: true, half: true, ph: '09XX XXX XXXX' },
        { t: 'radio', k: 'channel', label: 'How would you rather we get back to you?', cols: 2,
          opts: ['Email', 'Phone call', 'WhatsApp', 'Viber', 'Messenger', "Whichever's easiest"] },
        { t: 'text', k: 'besttime', label: 'Best time to reach you',
          hint: 'Optional.', ph: 'e.g. weekday mornings, after 5pm' }
      ] }
  ];

  /* Flatten collapse containers so read/validate/compile see every field. */
  STEPS.forEach(function (s) {
    s._flat = [];
    s.fields.forEach(function (f) {
      s._flat.push(f);
      if (f.t === 'collapse') f.fields.forEach(function (c) { s._flat.push(c); });
    });
  });

  /* Every option of a chips/radio field, grouped or flat, as objects. */
  function optionsOf(f) {
    if (f.groups) return flatOpts(f.groups);
    return (f.opts || []).map(function (o) { return typeof o === 'string' ? { v: o } : o; });
  }

  /* Project types that make website scope questions irrelevant. */
  function isAppOnly(d) {
    var s = d.solutions || [];
    if (!s.length) return false;
    var appish = ['A mobile app', 'A database or internal system', 'Professional email setup'];
    return s.every(function (v) { return appish.indexOf(v) > -1; });
  }

  /* ------------------------------------------------------------------ *
   * Want vs. need                                                       *
   * ------------------------------------------------------------------ */
  function assess(d) {
    var probs = d.problems || [], sols = d.solutions || [];
    var need = {}, gives = {};

    probs.forEach(function (v) {
      var m = PROBLEMS.filter(function (p) { return p.v === v; })[0];
      if (m && m.need) m.need.forEach(function (n) { need[n] = true; });
    });
    sols.forEach(function (v) {
      var m = SOLUTIONS.filter(function (s) { return s.v === v; })[0];
      if (m && m.gives) m.gives.forEach(function (g) { gives[g] = true; });
    });

    var unsure = !!gives.unsure;
    var gaps = Object.keys(need).filter(function (n) { return !gives[n] && CAP[n]; });
    var client = [], internal = [];

    if (d.worst) internal.push('TOP PRIORITY (client’s own pick) — ' + d.worst);

    if (gaps.length && !unsure) {
      client.push('Your answers point at a few things your plan may not cover yet: ' +
        joinList(gaps.map(function (g) { return CAP[g]; })) +
        ". We'll tell you honestly whether those are worth doing now, later, or not at all.");
      internal.push('GAP — problems imply capabilities the stated solution does not deliver: ' +
        gaps.join(', ') + '.');
    }

    /* Mobile app requested with no problem that needs one. */
    if (gives.mobileapp) {
      internal.push('OVER-SCOPE RISK — asked for a mobile app. None of the stated problems require ' +
        'a native app; a mobile-friendly website almost certainly solves them for far less. Lead with that.');
      client.push('You mentioned a mobile app. Before you commit to one, we’ll show you what a ' +
        'mobile-friendly website would do for the same problems — it is often a fraction of the cost.');
    }

    /* Chatbot alone, but the real problem is visibility. */
    if (gives.chatbot && !gives.site && !gives.redesign && (need.seo || need.site)) {
      internal.push('SEQUENCING — wants a chatbot, but stated problems include being unfindable. ' +
        'A bot has nothing to point at without a site. Site first.');
    }

    /* Site requested, but the pain is all workflow. */
    var workflow = ['chatbot', 'booking', 'forms', 'db', 'inquiry'].filter(function (n) { return need[n]; });
    if ((gives.site || gives.redesign) && workflow.length >= 2 && !unsure) {
      internal.push('MISMATCH — a brochure site will not resolve ' + workflow.join('/') +
        '. The value here is automation, not pages. Quote the workflow piece explicitly.');
    }

    if (unsure) {
      internal.push('OPEN — client says they do not know what they need. Strong consultative fit; ' +
        'lead with a recommendation, not a menu.');
    }
    if (d.certainty && d.certainty.indexOf('decided') === 0) {
      internal.push('FIXED VIEW — client considers the solution decided. Raise alternatives gently, once.');
    }
    if (d.certainty && d.certainty.indexOf('Honestly') === 0) {
      internal.push('GUESSING — explicitly invited us to tell them what to do. Recommend firmly.');
    }

    /* Scope vs money. */
    var big = probs.length >= 5;
    var low = d.budget_build === 'Under ₱20,000' || d.budget_build === '₱20,000 – 50,000';
    if (big && low) {
      internal.push('BUDGET GAP — ' + probs.length + ' problems raised against a ' + d.budget_build +
        ' build budget. Phase it' + (d.worst ? ' starting from the top priority above' : '') +
        ', or trim scope on the call before quoting.');
    }
    if (d.budget_build === 'Not sure — please advise') {
      internal.push('NO ANCHOR — no budget expectation set. Present tiered options.');
    }
    if (d.timeline === 'As soon as possible' && probs.length >= 4) {
      internal.push('TIMELINE RISK — wants it ASAP with broad scope. Set expectations on the first call.');
    }
    if (d.content_src && d.content_src.indexOf('most of it') > -1) {
      internal.push('CONTENT LOAD — client cannot supply copy or photos. Price writing and sourcing in.');
    }
    if (d.branding && d.branding.indexOf('create one') > -1) {
      internal.push('BRANDING NEEDED — no logo. Add identity work to the quote.');
    }

    if (!client.length) {
      client.push('Your answers line up well with what you have in mind. We’ll come back with a ' +
        'concrete recommendation and a realistic range.');
    }
    return { client: client, internal: internal };
  }

  function joinList(a) {
    if (a.length === 1) return a[0];
    if (a.length === 2) return a[0] + ' and ' + a[1];
    return a.slice(0, -1).join(', ') + ', and ' + a[a.length - 1];
  }

  /* ------------------------------------------------------------------ *
   * Rendering                                                           *
   * ------------------------------------------------------------------ */
  var form = document.getElementById('brief-form');
  var host = document.getElementById('brief-steps');
  var elNext = document.getElementById('brief-next');
  var elBack = document.getElementById('brief-back');
  var elSkip = document.getElementById('brief-skip');
  var elErr = document.getElementById('brief-err');
  var elErrText = document.getElementById('brief-err-text');
  var elBar = document.getElementById('brief-prog-bar');
  var elStepNo = document.getElementById('brief-prog-step');
  var elTime = document.getElementById('brief-prog-time');
  var elSaved = document.getElementById('brief-saved');
  var elLive = document.getElementById('brief-live');
  var elProgress = document.getElementById('brief-progress');
  var elNav = document.getElementById('brief-nav');
  var card = document.querySelector('.brief-card');
  if (!form || !host) return;

  var uid = 0;
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function chipHTML(f, o) {
    var v = o.v;
    var cid = 'bf' + (++uid);
    var sw = '';
    if (f.swatches && o.sw) {
      sw = '<span class="brief-sw" aria-hidden="true">' + o.sw.map(function (c) {
        return '<i style="background:' + esc(c) + '"></i>';
      }).join('') + '</span>';
    }
    return '<input type="checkbox" id="' + cid + '" name="' + esc(f.k) + '" value="' + esc(v) + '"' +
      (o.for ? ' data-for="' + esc(o.for.join(',')) + '"' : '') + '>' +
      '<label class="brief-chip" for="' + cid + '">' + sw + '<span>' + esc(v) + '</span></label>';
  }

  function fieldHTML(f) {
    var id = 'bf' + (++uid);
    var h = '<div class="brief-field" data-fk="' + esc(f.k) + '"' +
      (f.when ? ' data-cond="1"' : '') + '>';

    if (f.label) {
      var plain = f.t === 'chips' || f.t === 'radio' || f.t === 'rank' || f.t === 'collapse';
      h += '<label class="brief-field-label"' + (plain ? '' : ' for="' + id + '"') + '>' +
        esc(f.label) + (f.req ? ' <span class="brief-req">*</span>' : '') +
        (f.count ? ' <span class="brief-count" data-count-for="' + esc(f.k) + '"></span>' : '') + '</label>';
    }
    if (f.hint) h += '<span class="brief-field-hint">' + esc(f.hint) + '</span>';

    if (f.t === 'chips') {
      if (f.groups) {
        f.groups.forEach(function (g) {
          h += '<div class="brief-cluster"><div class="brief-cluster-label">' + esc(g.label) + '</div>' +
            '<div class="brief-chips" role="group" aria-label="' + esc(g.label) + '">' +
            g.opts.map(function (o) { return chipHTML(f, o); }).join('') + '</div></div>';
        });
      } else {
        h += '<div class="brief-chips" role="group" aria-label="' + esc(f.label || '') + '">' +
          optionsOf(f).map(function (o) { return chipHTML(f, o); }).join('') + '</div>';
      }
      /* Escape hatch, revealed only when the org filter actually hides something. */
      h += '<button type="button" class="brief-showall" data-showall="' + esc(f.k) + '" hidden></button>';
      if (f.other) {
        h += '<input type="text" class="form-input" name="' + esc(f.k) + '_other" placeholder="' +
          esc(f.other) + '" style="margin-top:12px;">';
      }
    } else if (f.t === 'radio') {
      h += '<div class="' + (f.cols === 2 ? 'brief-opts-2' : 'brief-opts') + '" role="radiogroup" aria-label="' +
        esc(f.label || '') + '">';
      optionsOf(f).forEach(function (o) {
        var rid = 'bf' + (++uid);
        h += '<input type="radio" id="' + rid + '" name="' + esc(f.k) + '" value="' + esc(o.v) + '">' +
          '<label class="brief-opt" for="' + rid + '"><span class="brief-opt-t">' + esc(o.v) + '</span>' +
          (o.d ? '<span class="brief-opt-d">' + esc(o.d) + '</span>' : '') + '</label>';
      });
      h += '</div>';
    } else if (f.t === 'rank') {
      h += '<div class="brief-opts" role="radiogroup" data-rank-host="' + esc(f.k) + '"></div>';
    } else if (f.t === 'collapse') {
      h += '<button type="button" class="brief-disclose" data-disclose="' + esc(f.k) + '" aria-expanded="false">' +
        '<span class="brief-disclose-icon" aria-hidden="true">+</span><span>' + esc(f.label) + '</span></button>' +
        '<div class="brief-disclose-body" data-disclose-body="' + esc(f.k) + '" hidden>' +
        f.fields.map(fieldHTML).join('') + '</div>';
    } else if (f.t === 'area') {
      h += '<textarea id="' + id + '" name="' + esc(f.k) + '" class="form-input" rows="' + (f.rows || 3) +
        '" placeholder="' + esc(f.ph || '') + '" style="resize:vertical;line-height:1.6;"></textarea>';
    } else {
      h += '<input type="' + esc(f.t) + '" id="' + id + '" name="' + esc(f.k) + '" class="form-input" placeholder="' +
        esc(f.ph || '') + '"' + (f.t === 'email' ? ' autocomplete="email"' : '') +
        (f.t === 'tel' ? ' autocomplete="tel"' : '') + '>';
    }
    return h + '</div>';
  }

  STEPS.forEach(function (s, i) {
    var sec = document.createElement('section');
    sec.className = 'brief-step';
    sec.setAttribute('data-step', s.id);
    sec.hidden = true;
    sec.setAttribute('tabindex', '-1');
    sec.setAttribute('aria-label', s.title);

    var head = '<div class="brief-step-eyebrow">' + esc(s.eyebrow) + '</div>' +
      '<h2 class="brief-step-title">' + esc(s.title) +
      (s.optional ? '<span class="brief-optional">Optional</span>' : '') + '</h2>' +
      '<p class="brief-step-sub">' + esc(s.sub) + '</p>';

    /* Group consecutive half-width fields into a two-column row. */
    var body = '', run = [];
    function flush() {
      if (!run.length) return;
      body += run.length > 1
        ? '<div class="brief-half-row">' + run.join('') + '</div>'
        : run[0];
      run = [];
    }
    s.fields.forEach(function (f) {
      if (f.half) { run.push(fieldHTML(f)); if (run.length === 2) flush(); }
      else { flush(); body += fieldHTML(f); }
    });
    flush();

    sec.innerHTML = head + body;
    host.appendChild(sec);
    s._el = sec;
    s._i = i;
  });

  /* Review step is built fresh each time it is shown. */
  var review = document.createElement('section');
  review.className = 'brief-step';
  review.setAttribute('data-step', 'review');
  review.hidden = true;
  review.setAttribute('tabindex', '-1');
  host.appendChild(review);

  /* ------------------------------------------------------------------ *
   * State                                                              *
   * ------------------------------------------------------------------ */
  function read() {
    var d = {};
    STEPS.forEach(function (s) {
      s._flat.forEach(function (f) {
        if (f.t === 'collapse') return;
        if (f.t === 'chips') {
          var vals = [];
          form.querySelectorAll('input[name="' + f.k + '"]:checked').forEach(function (n) { vals.push(n.value); });
          var ot = form.querySelector('[name="' + f.k + '_other"]');
          if (ot && ot.value.trim()) vals.push(ot.value.trim());
          if (vals.length) d[f.k] = vals;
        } else if (f.t === 'radio' || f.t === 'rank') {
          var r = form.querySelector('input[name="' + f.k + '"]:checked');
          if (r) d[f.k] = r.value;
        } else {
          var el = form.querySelector('[name="' + f.k + '"]');
          if (el && el.value.trim()) d[f.k] = el.value.trim();
        }
      });
    });
    return d;
  }

  function save() {
    var d = read();
    try {
      localStorage.setItem(STORE, JSON.stringify({ d: d, i: cur }));
      /* Only promise a save once there is actually an answer to restore. */
      if (Object.keys(d).length) elSaved.classList.add('on');
    } catch (e) { /* private mode — the form still works, just not resumable */ }
  }

  var pendingRank = null;

  function restore() {
    var saved;
    try { saved = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return 0; }
    if (!saved || !saved.d) return 0;
    var d = saved.d;
    Object.keys(d).forEach(function (k) {
      var v = d[k];
      if (k === 'worst') { pendingRank = v; return; }
      if (Array.isArray(v)) {
        var known = [];
        form.querySelectorAll('input[name="' + k + '"]').forEach(function (n) {
          known.push(n.value);
          if (v.indexOf(n.value) > -1) n.checked = true;
        });
        var extra = v.filter(function (x) { return known.indexOf(x) === -1; });
        var ot = form.querySelector('[name="' + k + '_other"]');
        if (ot && extra.length) ot.value = extra.join(', ');
      } else {
        var radios = form.querySelectorAll('input[type="radio"][name="' + k + '"]');
        if (radios.length) {
          radios.forEach(function (n) { if (n.value === v) n.checked = true; });
        } else {
          var el = form.querySelector('[name="' + k + '"]');
          if (el) el.value = v;
        }
      }
    });
    if (Object.keys(d).length) elSaved.classList.add('on');
    return typeof saved.i === 'number' ? saved.i : 0;
  }

  /* ------------------------------------------------------------------ *
   * Option filtering by org type                                        *
   * ------------------------------------------------------------------ */
  var showAll = {};   /* field key -> true once the visitor asks for everything */

  function orgCode(d) {
    return d.orgtype ? (ORG_CODE[d.orgtype] || '*') : '*';
  }

  function applyOptionFilter() {
    var d = read(), code = orgCode(d);
    STEPS.forEach(function (s) {
      s._flat.forEach(function (f) {
        if (f.t !== 'chips') return;
        var wrap = s._el.querySelector('[data-fk="' + f.k + '"]');
        if (!wrap) return;
        var hidden = 0;
        wrap.querySelectorAll('input[name="' + f.k + '"]').forEach(function (n) {
          var tags = n.getAttribute('data-for');
          /* No tag, no org chosen, "something else", already ticked, or the
             visitor asked to see everything -> always visible. */
          var keep = !tags || code === '*' || showAll[f.k] || n.checked ||
                     tags.split(',').indexOf(code) > -1;
          var label = wrap.querySelector('label[for="' + n.id + '"]');
          if (label) label.hidden = !keep;
          n.disabled = !keep;
          if (!keep) hidden++;
        });

        /* Collapse a cluster whose every option is filtered out. */
        wrap.querySelectorAll('.brief-cluster').forEach(function (cl) {
          var any = false;
          cl.querySelectorAll('.brief-chip').forEach(function (l) { if (!l.hidden) any = true; });
          cl.hidden = !any;
        });

        var btn = wrap.querySelector('[data-showall="' + f.k + '"]');
        if (btn) {
          if (hidden > 0 && !showAll[f.k]) {
            btn.hidden = false;
            btn.textContent = 'Show ' + hidden + ' more option' + (hidden === 1 ? '' : 's') +
              ' we hid for ' + (d.orgtype ? d.orgtype.toLowerCase() : 'you');
          } else {
            btn.hidden = true;
          }
        }
      });
    });
  }

  function updateCounts() {
    form.querySelectorAll('[data-count-for]').forEach(function (el) {
      var k = el.getAttribute('data-count-for');
      var n = form.querySelectorAll('input[name="' + k + '"]:checked').length;
      el.textContent = n ? n + ' selected' : '';
    });
  }

  /* ------------------------------------------------------------------ *
   * "Which hurts most?" — built from the boxes the client just ticked   *
   * ------------------------------------------------------------------ */
  function refreshRank() {
    STEPS.forEach(function (s) {
      s._flat.forEach(function (f) {
        if (f.t !== 'rank') return;
        var wrap = s._el.querySelector('[data-fk="' + f.k + '"]');
        var slot = wrap && wrap.querySelector('[data-rank-host="' + f.k + '"]');
        if (!slot) return;

        var chosen = [];
        form.querySelectorAll('input[name="' + f.from + '"]:checked').forEach(function (n) { chosen.push(n.value); });
        var ot = form.querySelector('[name="' + f.from + '_other"]');
        if (ot && ot.value.trim()) chosen.push(ot.value.trim());

        var current = pendingRank ||
          (form.querySelector('input[name="' + f.k + '"]:checked') || {}).value || null;

        /* Only worth asking once there is something to choose between. */
        if (chosen.length < 2) { wrap.hidden = true; slot.innerHTML = ''; return; }
        wrap.hidden = false;

        var h = '';
        chosen.forEach(function (v) {
          var rid = 'bf' + (++uid);
          h += '<input type="radio" id="' + rid + '" name="' + esc(f.k) + '" value="' + esc(v) + '"' +
            (v === current ? ' checked' : '') + '>' +
            '<label class="brief-opt" for="' + rid + '"><span class="brief-opt-t">' + esc(v) + '</span></label>';
        });
        slot.innerHTML = h;
        if (current && chosen.indexOf(current) > -1) pendingRank = null;
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Navigation                                                          *
   * ------------------------------------------------------------------ */
  var cur = 0;             // 0..n-1 = steps, n = review
  var TOTAL = STEPS.length;
  var submitted = false;

  function live() {
    var d = read();
    return STEPS.filter(function (s) { return !s.when || s.when(d); });
  }

  function applyConditionalFields() {
    var d = read();
    STEPS.forEach(function (s) {
      s._flat.forEach(function (f) {
        if (!f.when) return;
        var wrap = s._el.querySelector('[data-fk="' + f.k + '"][data-cond]');
        if (!wrap) return;
        var on = f.when(d);
        wrap.hidden = !on;
        wrap.querySelectorAll('input,textarea').forEach(function (n) { n.disabled = !on; });
      });
    });
  }

  /* Inapplicable steps must not submit their answers. */
  function applyStepGating() {
    var vis = live();
    STEPS.forEach(function (s) {
      var on = vis.indexOf(s) > -1;
      s._el.querySelectorAll('input,textarea').forEach(function (n) {
        if (!n.closest('[data-cond]')) n.disabled = !on;
      });
    });
  }

  /* Order matters: gating enables a whole step, then the filter re-disables
     the options that do not apply to this org type. */
  function refreshAll() {
    applyConditionalFields();
    applyStepGating();
    refreshRank();
    applyOptionFilter();
    updateCounts();
  }

  function show(i, focus) {
    hideErr();
    cur = i;
    refreshAll();

    STEPS.forEach(function (s) { s._el.hidden = true; });
    review.hidden = true;

    var vis = live();

    if (i >= TOTAL) {
      buildReview();
      review.hidden = false;
      elNext.textContent = 'Send my brief →';
      elBack.hidden = false;
      elSkip.hidden = true;
      elStepNo.textContent = 'Review';
      elTime.textContent = 'almost done';
      elBar.style.width = '100%';
      if (focus !== false) review.focus();
    } else {
      /* Skip forward past any step that no longer applies. */
      while (i < TOTAL && vis.indexOf(STEPS[i]) === -1) i++;
      if (i >= TOTAL) return show(TOTAL, focus);
      cur = i;
      var s = STEPS[i];
      s._el.hidden = false;
      var pos = vis.indexOf(s) + 1;
      elNext.textContent = pos === vis.length ? 'Review my answers →' : 'Continue →';
      elBack.hidden = i === 0;
      elSkip.hidden = !s.optional;
      elStepNo.textContent = 'Step ' + pos + ' of ' + vis.length;
      elTime.textContent = pos === 1 ? 'about 3 minutes' :
        (vis.length - pos <= 1 ? 'almost done' : 'about ' + Math.max(1, Math.round((vis.length - pos) * 0.3)) + ' min left');
      elBar.style.width = Math.round((pos - 1) / vis.length * 100) + '%';
      if (focus !== false) s._el.focus();
    }
    save();
  }

  function nextIndex(from) {
    var vis = live(), i = from + 1;
    while (i < TOTAL && vis.indexOf(STEPS[i]) === -1) i++;
    return i;
  }
  function prevIndex(from) {
    var vis = live(), i = Math.min(from, TOTAL) - 1;
    while (i >= 0 && vis.indexOf(STEPS[i]) === -1) i--;
    return Math.max(0, i);
  }

  function showErr(msg, el) {
    elErrText.textContent = msg;
    elErr.classList.add('on');
    elLive.textContent = msg;
    if (el) {
      el.classList.add('bad');
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    }
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function hideErr() {
    elErr.classList.remove('on');
    form.querySelectorAll('.bad').forEach(function (n) { n.classList.remove('bad'); });
  }

  function validate(s) {
    var d = read();
    for (var i = 0; i < s._flat.length; i++) {
      var f = s._flat[i];
      if (!f.req) continue;
      if (f.when && !f.when(d)) continue;
      var v = d[f.k];
      if (f.t === 'chips') {
        if (!v || !v.length) { showErr('Pick at least one option for “' + f.label + '”.'); return false; }
      } else if (f.t === 'radio') {
        if (!v) { showErr('Choose an option for “' + f.label + '”.'); return false; }
      } else {
        var el = form.querySelector('[name="' + f.k + '"]');
        if (!v) { showErr('“' + f.label + '” is needed so we can get back to you.', el); return false; }
        if (f.t === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
          showErr("That email doesn't look right — mind checking it?", el); return false;
        }
        if (f.t === 'tel' && v.replace(/\D/g, '').length < 7) {
          showErr('That number looks too short — mind checking it?', el); return false;
        }
      }
    }
    return true;
  }

  elNext.addEventListener('click', function () {
    if (cur >= TOTAL) { submit(); return; }
    if (!validate(STEPS[cur])) return;
    show(nextIndex(cur));
  });
  elBack.addEventListener('click', function () { show(prevIndex(cur)); });
  elSkip.addEventListener('click', function () { show(nextIndex(cur)); });

  /* Enter advances from single-line inputs. */
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var t = e.target;
    if (t.tagName === 'TEXTAREA') return;
    e.preventDefault();
    elNext.click();
  });

  /* Disclosure + "show all options" live inside the form. */
  form.addEventListener('click', function (e) {
    var dis = e.target.closest('[data-disclose]');
    if (dis) {
      var k = dis.getAttribute('data-disclose');
      var body = form.querySelector('[data-disclose-body="' + k + '"]');
      var open = dis.getAttribute('aria-expanded') === 'true';
      dis.setAttribute('aria-expanded', open ? 'false' : 'true');
      body.hidden = open;
      dis.querySelector('.brief-disclose-icon').textContent = open ? '+' : '–';
      return;
    }
    var sa = e.target.closest('[data-showall]');
    if (sa) {
      showAll[sa.getAttribute('data-showall')] = true;
      applyOptionFilter();
      elLive.textContent = 'All options shown.';
    }
  });

  form.addEventListener('change', function (e) {
    hideErr();
    /* Changing the org type re-filters everything; ticking a problem rebuilds
       the priority question; either way the counters refresh. */
    if (e.target.name === 'orgtype' || e.target.name === 'timeline' || e.target.name === 'solutions') {
      refreshAll();
      var vis = live(), s = STEPS[cur];
      if (s) {
        var pos = vis.indexOf(s) + 1;
        if (pos > 0) elStepNo.textContent = 'Step ' + pos + ' of ' + vis.length;
      }
    } else if (e.target.name === 'problems') {
      refreshRank();
      updateCounts();
    } else {
      updateCounts();
    }
    save();
  });
  form.addEventListener('input', debounce(function () {
    refreshRank();
    save();
  }, 500));

  function debounce(fn, ms) {
    var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  /* ------------------------------------------------------------------ *
   * Review                                                             *
   * ------------------------------------------------------------------ */
  function fmt(v) { return Array.isArray(v) ? v.join(' · ') : v; }

  function buildReview() {
    var d = read(), a = assess(d), vis = live();
    var h = '<div class="brief-step-eyebrow">Almost there</div>' +
      '<h2 class="brief-step-title">Does this look right?</h2>' +
      '<p class="brief-step-sub">Have a quick read. Tap <em>Edit</em> on any section to change it — nothing is sent until you press the button at the bottom.</p>';

    h += '<div class="brief-insight"><h3>What we’ll look at first</h3><ul>' +
      a.client.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></div>';

    h += '<div class="brief-review">';
    vis.forEach(function (s) {
      var rows = '';
      s._flat.forEach(function (f) {
        if (f.t === 'collapse') return;
        if (f.when && !f.when(d)) return;
        var v = d[f.k];
        if (!v || (Array.isArray(v) && !v.length)) return;
        rows += '<div class="brief-rev-row"><span class="brief-rev-k">' + esc(f.label) +
          '</span><span class="brief-rev-v">' + esc(fmt(v)) + '</span></div>';
      });
      if (!rows) return;
      h += '<div class="brief-rev-sec">' + esc(s.title) +
        ' <button type="button" class="brief-rev-edit" data-goto="' + s._i + '">Edit</button></div>' + rows;
    });
    h += '</div>';

    h += '<p style="font-size:13px;color:var(--color-text-muted);line-height:1.6;margin-top:26px;">' +
      'We use this only to prepare your recommendation and get back to you. We don’t sell or share it.</p>';

    review.innerHTML = h;
    review.querySelectorAll('[data-goto]').forEach(function (b) {
      b.addEventListener('click', function () { show(parseInt(b.getAttribute('data-goto'), 10)); });
    });
  }

  /* ------------------------------------------------------------------ *
   * Compile + submit                                                   *
   * ------------------------------------------------------------------ */
  function compile(d) {
    var vis = live(), out = [];
    out.push('PROJECT BRIEF — ' + (d.org || 'Unnamed organization'));
    out.push('Submitted from cortanatechsolutions.com/project-brief.html');
    out.push('');
    vis.forEach(function (s) {
      var lines = [];
      s._flat.forEach(function (f) {
        if (f.t === 'collapse') return;
        if (f.when && !f.when(d)) return;
        var v = d[f.k];
        if (!v || (Array.isArray(v) && !v.length)) return;
        lines.push('  ' + f.label + ':');
        if (Array.isArray(v)) v.forEach(function (x) { lines.push('    - ' + x); });
        else lines.push('    ' + v);
      });
      if (!lines.length) return;
      out.push(s.title.toUpperCase());
      out.push(lines.join('\n'));
      out.push('');
    });
    return out.join('\n');
  }

  function submit() {
    if (submitted) return;
    var d = read();

    /* Re-check every required answer in case a step was jumped past. */
    var vis = live();
    for (var i = 0; i < vis.length; i++) {
      if (!validate(vis[i])) { show(vis[i]._i); return; }
    }

    submitted = true;
    elNext.disabled = true;
    elNext.textContent = 'Sending…';

    var a = assess(d);
    var body = new FormData();
    body.append('_subject', 'Project Brief — ' + (d.org || d.name || 'new enquiry'));
    body.append('name', d.name || '');
    body.append('email', d.email || '');
    body.append('phone', d.phone || '');
    body.append('organization', d.org || '');
    body.append('brief', compile(d));
    body.append('internal_assessment', a.internal.length
      ? a.internal.map(function (x, n) { return (n + 1) + '. ' + x; }).join('\n')
      : 'No mismatches flagged — stated solution matches stated problems.');
    var g = form.querySelector('[name="_gotcha"]');
    if (g) body.append('_gotcha', g.value);

    fetch(ENDPOINT, { method: 'POST', body: body, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('bad status'); done(d); })
      .catch(function () {
        submitted = false;
        elNext.disabled = false;
        elNext.textContent = 'Send my brief →';
        showErr('We couldn’t send that — your answers are still saved here. Please try again, or email us at ' +
          CONTACT_EMAIL + ' and we’ll pick it up from there.');
      });
  }

  function done(d) {
    try { localStorage.removeItem(STORE); } catch (e) { /* nothing to clear */ }
    var text = compile(d);
    elProgress.hidden = true;
    elNav.hidden = true;
    elSaved.classList.remove('on');
    host.innerHTML =
      '<div class="brief-done" tabindex="-1" id="brief-done">' +
      '<div class="brief-done-ring"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="30" height="30" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg></div>' +
      '<h2 class="brief-step-title" style="margin-bottom:14px;">Got it — thank you, ' + esc((d.name || '').split(' ')[0]) + '</h2>' +
      '<p class="brief-step-sub" style="margin:0 auto 4px;max-width:460px;">Your brief is with us. We’ll read it properly and come back within one business day with a recommendation — including anything we think you <em>don’t</em> need to spend money on.</p>' +
      '<p style="font-size:14px;color:var(--color-text-muted);line-height:1.65;max-width:460px;margin:18px auto 0;">Have a logo or photos to send? Email them to <strong>' + esc(CONTACT_EMAIL) + '</strong> and mention ' + esc(d.org || 'your organization') + '.</p>' +
      '<div class="brief-done-actions">' +
      '<button type="button" class="btn-primary" id="brief-dl">Download a copy</button>' +
      '<a href="work.html" class="brief-btn-back" style="text-decoration:underline;text-underline-offset:2px;">See work we’ve done →</a>' +
      '</div></div>';

    var dl = document.getElementById('brief-dl');
    if (dl) {
      dl.addEventListener('click', function () {
        var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a2 = document.createElement('a');
        a2.href = url;
        a2.download = 'project-brief-' + (d.org || 'cortanatech').toLowerCase()
          .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.txt';
        document.body.appendChild(a2); a2.click(); a2.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    }
    var doneEl = document.getElementById('brief-done');
    if (doneEl) doneEl.focus();
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ------------------------------------------------------------------ *
   * Boot                                                               *
   * ------------------------------------------------------------------ */
  var resumeAt = restore();
  show(Math.min(resumeAt, TOTAL), false);
  if (resumeAt > 0) {
    elLive.textContent = 'Picked up where you left off.';
  }
})();
