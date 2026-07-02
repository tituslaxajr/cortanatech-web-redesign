/*
 * MEETING_ROLES — all per-role content for "The First Meeting" homepage.
 * Pure data, no logic. Copy edits happen here and never touch the runtime.
 *
 * Pain ids (web, data, questions, email, time) are stable across roles so
 * a visitor's selections survive switching roles mid-page.
 */
window.MEETING_ROLES = {

  _default: {
    key: '_default',
    label: 'Organization',
    noun: 'organization',
    headline: 'Your mission deserves better tools.',
    subline: 'Practical, affordable digital systems — websites, email, chatbots, and web apps — so your organization can focus on what matters most.',
    painsIntro: 'Every organization we work with arrives carrying a version of these. Tap any that sound like yours — we’ll fold them into your message at the bottom of the page.',
    pains: [
      { id: 'web', label: 'Our website is outdated — or we don’t really have one', detail: 'It doesn’t reflect who you are now, and you quietly hope people don’t look at it.' },
      { id: 'data', label: 'Everything lives in spreadsheets', detail: 'Records, contacts, events — scattered across files only one person understands.' },
      { id: 'questions', label: 'We answer the same questions over and over', detail: 'Hours every week spent repeating information that could answer itself.' },
      { id: 'email', label: 'We still write from a personal email address', detail: 'First impressions are made before you even say hello — and @gmail.com says the wrong thing.' },
      { id: 'time', label: 'Nobody has time to own the tech', detail: 'Everyone’s stretched already. Every new tool feels like more work, not less.' }
    ],
    services: {
      web:     { title: 'Website Design & Development', blurb: 'A clear, credible website that represents your mission — built affordably, maintained by us.' },
      email:   { title: 'Professional Email Setup', blurb: 'Branded addresses on Microsoft 365 or Google Workspace, usually set up within 48 hours.' },
      chatbot: { title: 'Chatbot Development', blurb: 'A friendly assistant on your site that answers common questions around the clock.' },
      app:     { title: 'Custom Web Applications', blurb: 'Registration systems, databases, and portals built around your exact workflow.' }
    },
    proof: {
      name: 'Baptist Bible Seminary & Institute, Inc.',
      img: 'assets/photos/bbsi-homepage.jpg',
      imgAlt: 'Screenshot of the Baptist Bible Seminary and Institute homepage',
      blurb: 'A full digital presence — website and professional email — built from the ground up for a Philippine seminary.',
      tags: ['Website Design', 'Professional Email'],
      quote: '“We are thankful for the privilege of partnering with Cortanatech Solutions… The professionalism of their services is commendable.”',
      attribution: 'Evangel Balmes, IT Administrator, BBSI',
      link: 'https://bbsi.edu.ph', linkLabel: 'See it live →'
    },
    calc: {
      intro: 'Manual admin never shows up as a line item — it hides inside everyone’s week. Put rough numbers on yours.',
      hoursDefault: 8, rateDefault: 300,
      hoursLabel: 'Hours your team spends each week on manual admin',
      rateLabel: 'What an hour of that time is worth (₱)',
      reframe: 'That’s before counting a single missed visitor, member, or supporter. Most systems we build cost a fraction of one year of that — and keep working every year after.'
    },
    chat: {
      intro: 'This is a working demo of the kind of assistant we build — try it. Yours would be trained on your organization’s real information.',
      greeting: 'Hi! 👋 I’m a demo assistant — the kind CortanaTech builds for organizations like yours. Ask me something a visitor might ask.',
      nodes: {
        start: { options: [
          { label: 'What services do you offer?', next: 'services' },
          { label: 'How much does a website cost?', next: 'cost' },
          { label: 'How would a chatbot help us?', next: 'why' }
        ]},
        services: { bot: ['We help with four things: websites, professional email, chatbots (like me!), and custom web apps — all built for mission-driven organizations.'], options: [
          { label: 'How would this work for us?', next: 'why' },
          { label: 'Talk to a human →', next: '#contact' },
          { label: '↺ Start over', next: 'start' }
        ]},
        cost: { bot: ['Every project is quoted up front — no surprises. Most clients are surprised how affordable it is; tell the team what you need and you’ll get a fixed quote within days.'], options: [
          { label: 'Talk to a human →', next: '#contact' },
          { label: '↺ Start over', next: 'start' }
        ]},
        why: { bot: ['A chatbot like me answers your community’s common questions instantly, 24/7 — trained on your real information, speaking your language.', 'That’s hours a week your team gets back.'], options: [
          { label: 'I want one — talk to a human →', next: '#contact' },
          { label: '↺ Start over', next: 'start' }
        ]}
      }
    },
    cta: {
      heading: 'Your message is already half-written.',
      sub: 'Everything you told us on this page is below — edit anything, add anything, and send. A real person replies within one business day.',
      button: 'Send it →',
      subject: 'Website inquiry',
      opener: 'Hi CortanaTech — we’re a mission-driven organization.'
    }
  },

  church: {
    key: 'church',
    label: 'Church',
    noun: 'church',
    photo: 'assets/photos/audience/church-congregation.jpg',
    photoAlt: 'A church congregation gathered in worship',
    pickTag: 'Reach your community beyond Sunday.',
    headline: 'Your ministry shouldn’t be stuck managing technology.',
    subline: 'Websites, email, chatbots, and simple systems built for churches — so your team can focus on people, not passwords.',
    painsIntro: 'We’ve sat with a lot of church teams. These are the things they tell us — tap any that sound like your church.',
    pains: [
      { id: 'web', label: 'Our website was last updated years ago', detail: 'It doesn’t reflect who your church is today — and visitors check it before they ever visit.' },
      { id: 'data', label: 'Membership, giving, events — all in one volunteer’s spreadsheet', detail: 'If that one person is away, the whole system is away with them.' },
      { id: 'questions', label: 'We answer the same questions every single week', detail: '“What time is the service?” “Where are you located?” “Is there a youth group?” — again and again.' },
      { id: 'email', label: 'The church still emails from a personal Gmail', detail: 'pastor.john.1972@gmail.com doesn’t build the trust your ministry deserves.' },
      { id: 'time', label: 'No one on staff has time (or training) for tech', detail: 'Your team signed up for ministry, not server settings.' }
    ],
    services: {
      web:     { title: 'Website Design & Development', blurb: 'A warm, welcoming church website — service times, sermons, and events your community can actually find.' },
      email:   { title: 'Professional Email Setup', blurb: 'pastor@yourchurch.org instead of a personal Gmail — trust built before you say hello.' },
      chatbot: { title: 'Chatbot Development', blurb: '“What time is Sunday service?” answered instantly, any hour, without a volunteer on duty.' },
      app:     { title: 'Custom Web Applications', blurb: 'Membership, giving, and event tools — like StewardTrack, our platform built for Philippine churches.' }
    },
    proof: {
      name: 'Baptist Bible Seminary & Institute, Inc.',
      img: 'assets/photos/bbsi-homepage.jpg',
      imgAlt: 'Screenshot of the Baptist Bible Seminary and Institute homepage',
      blurb: 'A ministry’s full digital presence — website and professional email — built from the ground up.',
      tags: ['Website Design', 'Professional Email'],
      quote: '“We are thankful for the privilege of partnering with Cortanatech Solutions… The professionalism of their services is commendable.”',
      attribution: 'Evangel Balmes, IT Administrator, BBSI',
      link: 'https://bbsi.edu.ph', linkLabel: 'See it live →'
    },
    calc: {
      intro: 'Church admin hides in volunteers’ evenings and staff members’ margins. Put rough numbers on what it adds up to.',
      hoursDefault: 6, rateDefault: 250,
      hoursLabel: 'Hours your staff & volunteers spend weekly on manual admin',
      rateLabel: 'What an hour of that time is worth (₱)',
      reframe: 'That’s time that could go to visitation, discipleship, and rest. Most church systems we build cost a fraction of one year of that.'
    },
    chat: {
      intro: 'This is a working demo — imagine it on your church’s website, trained on your real service times and ministries. Try it.',
      greeting: 'Hi! 👋 Welcome to Grace Community Church (a demo). I’m the church’s assistant — how can I help you today?',
      nodes: {
        start: { options: [
          { label: 'What time are Sunday services?', next: 'times' },
          { label: 'Do you have a youth ministry?', next: 'youth' },
          { label: 'How can I get one of these for my church?', next: 'pitch' }
        ]},
        times: { bot: ['We gather Sundays at 9:00 AM and 4:00 PM, with prayer meeting Wednesdays at 7:00 PM. First time? Just come as you are — we’d love to meet you!'], options: [
          { label: 'Do you have a youth ministry?', next: 'youth' },
          { label: 'How can my church get this?', next: 'pitch' },
          { label: '↺ Start over', next: 'start' }
        ]},
        youth: { bot: ['Yes! Youth fellowship meets Saturdays at 3:00 PM, and there’s Sunday school for kids during the morning service. Want me to note that you’re interested? A leader would follow up personally.'], options: [
          { label: 'How can my church get this?', next: 'pitch' },
          { label: '↺ Start over', next: 'start' }
        ]},
        pitch: { bot: ['Everything I just did — answering instantly, any hour, in your church’s own voice — is what CortanaTech builds. Your version would know YOUR services, ministries, and events.', 'No volunteer needed on duty. It just answers.'], options: [
          { label: 'Talk to a human about it →', next: '#contact' },
          { label: '↺ Start over', next: 'start' }
        ]}
      }
    },
    cta: {
      heading: 'Your message is already half-written.',
      sub: 'Everything you told us on this page is below — edit anything, add anything, and send. A real person replies within one business day.',
      button: 'Send it →',
      subject: 'Website inquiry — Church',
      opener: 'Hi CortanaTech — we’re a church.'
    }
  },

  school: {
    key: 'school',
    label: 'School',
    noun: 'school',
    photo: 'assets/photos/audience/school-classroom.jpg',
    photoAlt: 'Students learning in a classroom',
    pickTag: 'Modernize without overwhelming your staff.',
    headline: 'Modern school systems that don’t overwhelm your staff.',
    subline: 'Enrollment tools, parent communication, and a website families can actually use — built for schools, priced for schools.',
    painsIntro: 'Schools don’t fall behind because they don’t care — every option just feels like more work. Sound familiar? Tap what does.',
    pains: [
      { id: 'web', label: 'Parents can’t find what they need on our website', detail: 'Enrollment info, requirements, calendars — buried, outdated, or missing entirely.' },
      { id: 'data', label: 'Enrollment lives in paper forms and spreadsheets', detail: 'Every enrollment season, the same stack of paper and the same late nights.' },
      { id: 'questions', label: 'The office phone rings all day with the same questions', detail: '“When does enrollment open?” “What are the requirements?” — hours of staff time, daily.' },
      { id: 'email', label: 'Staff email parents from mixed personal accounts', detail: 'Official communication deserves an official address — registrar@yourschool.edu.ph.' },
      { id: 'time', label: 'Every new tool feels like more work for stretched staff', detail: 'Your teachers are already at capacity. Technology should subtract work, not add it.' }
    ],
    services: {
      web:     { title: 'Website Design & Development', blurb: 'A school website parents actually use — enrollment info, calendars, and announcements in one findable place.' },
      email:   { title: 'Professional Email Setup', blurb: 'Official addresses for faculty and staff — registrar@yourschool.edu.ph, not a personal inbox.' },
      chatbot: { title: 'Chatbot Development', blurb: '“When does enrollment open?” answered instantly — your office phone finally gets a rest.' },
      app:     { title: 'Custom Web Applications', blurb: 'Online enrollment portals and student records — enrollment season without the paper stacks.' }
    },
    proof: {
      name: 'Baptist Bible Seminary & Institute, Inc.',
      img: 'assets/photos/bbsi-homepage.jpg',
      imgAlt: 'Screenshot of the Baptist Bible Seminary and Institute homepage',
      blurb: 'An educational institution’s full digital presence — website and professional email — built from the ground up.',
      tags: ['Website Design', 'Professional Email'],
      quote: '“We are thankful for the privilege of partnering with Cortanatech Solutions… The professionalism of their services is commendable.”',
      attribution: 'Evangel Balmes, IT Administrator, BBSI',
      link: 'https://bbsi.edu.ph', linkLabel: 'See it live →'
    },
    calc: {
      intro: 'Registrar hours, office phone hours, enrollment-season overtime — put rough numbers on what manual processes cost your school.',
      hoursDefault: 10, rateDefault: 300,
      hoursLabel: 'Hours your staff spend weekly on manual admin & inquiries',
      rateLabel: 'What an hour of staff time is worth (₱)',
      reframe: 'That’s before counting a single frustrated parent or lost enrollee. Most school systems we build cost a fraction of one year of that.'
    },
    chat: {
      intro: 'This is a working demo — imagine it on your school’s website during enrollment season. Try it.',
      greeting: 'Hi! 👋 Welcome to San Miguel Academy (a demo). I’m the school’s assistant — how can I help?',
      nodes: {
        start: { options: [
          { label: 'When does enrollment open?', next: 'enroll' },
          { label: 'What are the requirements?', next: 'reqs' },
          { label: 'How can my school get this?', next: 'pitch' }
        ]},
        enroll: { bot: ['Enrollment for the coming school year opens June 1 and closes July 15. You can start online — no need to visit the office for the first step!'], options: [
          { label: 'What are the requirements?', next: 'reqs' },
          { label: 'How can my school get this?', next: 'pitch' },
          { label: '↺ Start over', next: 'start' }
        ]},
        reqs: { bot: ['For new students: PSA birth certificate, report card (Form 138), certificate of good moral character, and two 2x2 photos. Transferees also need Form 137. Want the checklist emailed to you?'], options: [
          { label: 'How can my school get this?', next: 'pitch' },
          { label: '↺ Start over', next: 'start' }
        ]},
        pitch: { bot: ['Every answer I just gave is one less call to your office. CortanaTech trains an assistant like me on YOUR school’s real dates, fees, and requirements.', 'Your staff answer a question once — it answers it forever.'], options: [
          { label: 'Talk to a human about it →', next: '#contact' },
          { label: '↺ Start over', next: 'start' }
        ]}
      }
    },
    cta: {
      heading: 'Your message is already half-written.',
      sub: 'Everything you told us on this page is below — edit anything, add anything, and send. A real person replies within one business day.',
      button: 'Send it →',
      subject: 'Website inquiry — School',
      opener: 'Hi CortanaTech — we’re a school.'
    }
  },

  nonprofit: {
    key: 'nonprofit',
    label: 'Nonprofit',
    noun: 'nonprofit',
    photo: 'assets/photos/audience/nonprofit-volunteers.jpg',
    photoAlt: 'Nonprofit volunteers working together',
    pickTag: 'Turn goodwill into lasting support.',
    headline: 'Spend your hours on the cause, not the spreadsheet.',
    subline: 'Donor-ready websites, clean records, and reporting that takes minutes — built for nonprofits that run lean.',
    painsIntro: 'Spreadsheets feel free — until they cost you time, accuracy, and trust. Tap whichever of these your team knows too well.',
    pains: [
      { id: 'web', label: 'Donors visit our website and it doesn’t inspire confidence', detail: 'People give to organizations that look like they’ll steward it well. Your site is part of that answer.' },
      { id: 'data', label: 'Donor and beneficiary records live in scattered spreadsheets', detail: 'Finding one child’s record, one donor’s history, takes minutes that should take seconds.' },
      { id: 'questions', label: 'Reporting to sponsors takes days of copy-paste', detail: 'Updates your supporters deserve, delayed by manual assembly every single time.' },
      { id: 'email', label: 'We contact donors from a personal email address', detail: 'Generosity follows trust — and trust starts with info@yourorg.org.' },
      { id: 'time', label: 'We’re mostly volunteers — nobody owns the tech', detail: 'Systems that need a full-time admin don’t fit an organization run on donated hours.' }
    ],
    services: {
      web:     { title: 'Website Design & Development', blurb: 'A website that earns donor confidence — your story, impact, and giving options, clearly told.' },
      email:   { title: 'Professional Email Setup', blurb: 'info@yourorg.org for every volunteer who speaks for you — trust in the From line.' },
      chatbot: { title: 'Chatbot Development', blurb: 'Donation FAQs, volunteer sign-ups, program info — answered while your team is in the field.' },
      app:     { title: 'Custom Web Applications', blurb: 'Like Kalinga: sponsor-to-child records in seconds instead of scattered spreadsheets.' }
    },
    proof: {
      name: 'Kalinga — Kapatid Ministry',
      img: 'assets/photos/kalinga-homepage.jpg',
      imgAlt: 'Screenshot of the Kalinga child sponsorship platform',
      blurb: 'A child-sponsorship nonprofit’s records, transformed — sponsors connected to children in seconds instead of scattered spreadsheets.',
      tags: ['Custom Web App', 'Nonprofit Software'],
      quote: '“Records in seconds instead of scattered spreadsheets.”',
      attribution: 'Kalinga sponsorship platform, Kapatid Ministry',
      link: 'work.html', linkLabel: 'View case study →'
    },
    calc: {
      intro: 'Volunteer hours are donations too. Put rough numbers on what manual record-keeping is quietly spending.',
      hoursDefault: 8, rateDefault: 250,
      hoursLabel: 'Hours your team spends weekly on records & reporting',
      rateLabel: 'What an hour of that time is worth (₱)',
      reframe: 'That’s donated time going to copy-paste instead of the cause. Most nonprofit systems we build cost a fraction of one year of that.'
    },
    chat: {
      intro: 'This is a working demo — imagine it answering your donors and volunteers while your team is in the field. Try it.',
      greeting: 'Hi! 👋 Welcome to Bayanihan Foundation (a demo). I’m the foundation’s assistant — how can I help?',
      nodes: {
        start: { options: [
          { label: 'How do I sponsor a child?', next: 'sponsor' },
          { label: 'Can I volunteer?', next: 'volunteer' },
          { label: 'How can my nonprofit get this?', next: 'pitch' }
        ]},
        sponsor: { bot: ['Sponsorship is ₱800/month and covers a child’s schooling, meals, and check-ups. You’ll receive updates and letters from the child you sponsor. Shall I connect you with our sponsorship coordinator?'], options: [
          { label: 'Can I volunteer too?', next: 'volunteer' },
          { label: 'How can my nonprofit get this?', next: 'pitch' },
          { label: '↺ Start over', next: 'start' }
        ]},
        volunteer: { bot: ['Yes please! We need help with tutoring, events, and outreach days. Most volunteers give 2–4 hours a month — every hour counts. I can pass your details to our volunteer lead.'], options: [
          { label: 'How can my nonprofit get this?', next: 'pitch' },
          { label: '↺ Start over', next: 'start' }
        ]},
        pitch: { bot: ['I just handled a donor inquiry and a volunteer sign-up — at 11 PM, with nobody on duty. That’s what CortanaTech builds, trained on YOUR programs and your voice.', 'Your team stays in the field; the questions still get answered.'], options: [
          { label: 'Talk to a human about it →', next: '#contact' },
          { label: '↺ Start over', next: 'start' }
        ]}
      }
    },
    cta: {
      heading: 'Your message is already half-written.',
      sub: 'Everything you told us on this page is below — edit anything, add anything, and send. A real person replies within one business day.',
      button: 'Send it →',
      subject: 'Website inquiry — Nonprofit',
      opener: 'Hi CortanaTech — we’re a nonprofit.'
    }
  },

  startup: {
    key: 'startup',
    label: 'Startup',
    noun: 'startup',
    photo: 'assets/photos/audience/startup-entrepreneur.jpg',
    photoAlt: 'A founder working on her startup',
    pickTag: 'Look established from day one.',
    headline: 'Look established from day one.',
    subline: 'Professional website, branded email, and automation — agency-quality presence without agency prices.',
    painsIntro: 'Every founder we meet is fighting the same credibility battle. Tap what you’re fighting right now.',
    pains: [
      { id: 'web', label: 'Great product, no professional web presence yet', detail: 'Prospects Google you before they reply to you — and right now they find nothing (or worse).' },
      { id: 'data', label: 'Manual processes are eating hours we should spend selling', detail: 'Onboarding, invoicing, follow-ups — copy-paste work that a system should be doing.' },
      { id: 'questions', label: 'Leads ask the same questions before every deal', detail: 'Pricing, features, timelines — answered one email at a time while the lead cools off.' },
      { id: 'email', label: 'We’re still emailing clients from @gmail.com', detail: 'Enterprise clients notice. hello@yourstartup.com closes doors slower.' },
      { id: 'time', label: 'We can’t afford a full-time developer or big agency', detail: 'You need senior-level execution at a stage-appropriate price.' }
    ],
    services: {
      web:     { title: 'Website Design & Development', blurb: 'A site that makes you look established from day one — fast, credible, and built to convert.' },
      email:   { title: 'Professional Email Setup', blurb: 'hello@yourstartup.com in under 48 hours — look enterprise-ready in every inbox.' },
      chatbot: { title: 'Chatbot Development', blurb: 'Qualify leads and answer pricing questions instantly — even while you sleep.' },
      app:     { title: 'Custom Web Applications', blurb: 'Automate onboarding, bookings, and internal ops — built on React, C#, and Azure.' }
    },
    proof: {
      name: 'Megopic — Taylor University',
      img: 'assets/photos/megopic-homepage.jpg',
      imgAlt: 'Screenshot of the Megopic conference website',
      blurb: 'A medical conference moved fully online — registration, agenda, and abstract submission on one fast site, on a deadline.',
      tags: ['Event Website', 'Registration & Ticketing'],
      quote: '“Registration, agenda, and abstract submission — one site, on deadline.”',
      attribution: 'Megopic conference platform',
      link: 'work.html', linkLabel: 'View case study →'
    },
    calc: {
      intro: 'Founder hours are the most expensive hours in the company. Put rough numbers on where yours are leaking.',
      hoursDefault: 12, rateDefault: 500,
      hoursLabel: 'Hours per week lost to manual ops & repeated questions',
      rateLabel: 'What an hour of founder/team time is worth (₱)',
      reframe: 'That’s runway burning on copy-paste. Most systems we build cost a fraction of one year of that — and scale with you.'
    },
    chat: {
      intro: 'This is a working demo — imagine it qualifying your leads while you’re in a pitch meeting. Try it.',
      greeting: 'Hi! 👋 Welcome to LaunchPad PH (a demo startup). I’m the company’s assistant — what can I help with?',
      nodes: {
        start: { options: [
          { label: 'What does your product cost?', next: 'pricing' },
          { label: 'Can I book a demo?', next: 'demo' },
          { label: 'How can my startup get this?', next: 'pitch' }
        ]},
        pricing: { bot: ['Plans start at ₱2,499/month for small teams, with a 14-day free trial — no credit card needed. Want me to send a full pricing sheet to your email?'], options: [
          { label: 'Can I book a demo?', next: 'demo' },
          { label: 'How can my startup get this?', next: 'pitch' },
          { label: '↺ Start over', next: 'start' }
        ]},
        demo: { bot: ['Absolutely — I can book you straight into the team’s calendar. Most demos run 20 minutes. I’ll just need your name and email, and you’ll get an invite instantly.'], options: [
          { label: 'How can my startup get this?', next: 'pitch' },
          { label: '↺ Start over', next: 'start' }
        ]},
        pitch: { bot: ['I just quoted pricing and offered to book a meeting — no salesperson awake. CortanaTech builds assistants like me trained on YOUR product, pricing, and calendar.', 'Your leads get answers in seconds, not next-business-day.'], options: [
          { label: 'Talk to a human about it →', next: '#contact' },
          { label: '↺ Start over', next: 'start' }
        ]}
      }
    },
    cta: {
      heading: 'Your message is already half-written.',
      sub: 'Everything you told us on this page is below — edit anything, add anything, and send. A real person replies within one business day.',
      button: 'Send it →',
      subject: 'Website inquiry — Startup',
      opener: 'Hi CortanaTech — we’re a startup.'
    }
  }
};
