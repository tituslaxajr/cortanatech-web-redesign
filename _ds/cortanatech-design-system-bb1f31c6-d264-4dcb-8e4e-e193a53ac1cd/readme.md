# CortanaTech Design System

> **Last updated:** June 2026  
> **Sources:** Branding Guide 2024 (PDF), cortanatechsolutions.com (live site screenshot), logo assets (PNG × 4)

---

## Company Overview

**Cortanatech Solutions, Inc.** is a digital agency that helps **churches, nonprofits, schools, and startups** focus on their mission through simple, practical digital systems — from websites and databases to web apps and automation tools.

The company positions itself not as a vendor but as a **partner in the client's mission**: we come alongside them rather than talk down at them. The tone is simultaneously professional/reliable (blue, white, clean typography) and warm/human-centered (photo-first layouts, accessible copy, relatable CTAs).

**Known clients:** Baptist Bible Seminary & Institute, Inc.

**Services offered:**
- Website design & development
- Professional email setup
- Chatbot development
- Custom web application development

**Tech stack:** Azure, C#, React, JavaScript, Visual Studio, WordPress

---

## Sources

| Resource | Path / URL | Notes |
|---|---|---|
| Branding Guide 2024 (PDF) | `uploads/CortanaTech Solutions Branding Guide_2024.pdf` | Embedded fonts: Urbanist, DM Sans. Colors: #2B3990, #1C75BC, #454C59, #F1EDED, #D1D0CE. |
| Logo — on blue | `assets/logos/logo-on-blue.png` | Full logo on brand gradient background |
| Logo — on white | `assets/logos/logo-on-white.png` | Full logo, gradient icon + logotype |
| Icon mark | `assets/logos/icon-mark.png` | Standalone icon/brandmark |
| Logo — dark | `assets/logos/logo-dark.png` | Dark wordmark on white |
| Website screenshot | `uploads/screencapture-cortanatechsolutions-2026-06-15-17_12_13.png` | Full-page scroll, 1920×6832px |

---

## Content Fundamentals

### Tone
Professional, warm, and mission-centric. Cortanatech speaks as a trusted partner, not a vendor. Copy is confident without being boastful — "We are your trusted business aid for Digital Innovation."

### Voice perspective
**We/Us** for Cortanatech. **You/Your** for the client. The company positions itself as participant in the client's mission.

### Casing rules
- **Headings / nav links:** Title Case — "Partner With Us", "Our Work"  
- **Body copy:** Sentence case — "We're a digital agency transforming company websites."  
- **Eyebrow labels:** Sentence case with mild excitement — "Welcome to Cortanatech Solutions!" or "See Our Work"  
- **No all-caps** (except small tracked-out eyebrows when styled purely as a design element)

### Length & structure
- Hero headlines: short, punchy, 8–12 words  
- Body paragraphs: 1–3 sentences max per block  
- CTAs: direct, action-forward verbs — "Get Started", "Learn more", "See it in action", "Sign Up"  
- No jargon; technical concepts explained in plain language for non-technical clients

### Emoji & icons
No emoji in headings or body copy. Line-style icons used sparingly on blue overlay sections. No decorative emoji.

---

## Visual Foundations

### Colors
Two-color brand palette anchored in blue and navy:
- **Primary blue** `#1C75BC` — main interactive color, links, accents, eyebrow labels
- **Navy** `#2B3990` — headings (on white), CTA buttons (primary/dominant), footer banners, logo background
- **Gradient** `linear-gradient(135deg, #1C75BC → #2B3990)` — logo bg, hero overlays, service section bg
- **Warm off-white** `#F1EDED` — alternating section background (testimonial, leadership, cards)
- **Charcoal** `#454C59` — secondary/body text
- **Near-black** `#1E1F1E` — primary text, headings on light backgrounds
- **Light gray** `#D1D0CE` — borders
- **White** `#FFFFFF` — default surface, cards, nav

### Typography
- **Display / Headings:** Urbanist (Black 900, Bold 700) — tight tracking, large scale
- **Body / UI:** DM Sans (Regular 400, Medium 500, SemiBold 600) — relaxed leading, readable
- **Mono:** DM Mono — code/technical labels only
- Scale: 12px → 14px → 16px → 18px → 24px → 32px → 40px → 48px → 60px

### Backgrounds & section treatments
Three alternating section types used in strict rotation:
1. **White** — hero, portfolio, newsfeed
2. **Warm off-white (#F1EDED)** — testimonials, leadership, form areas
3. **Blue gradient overlay on photo** — services/partner, blog (photo-bg + `rgba(28,117,188,0.82)` → `rgba(43,57,144,0.82)`)
4. **Solid navy (#2B3990)** — CTA banner (footer)

### Images & photography
- People-first photography: diverse teams, collaborative settings
- Warm-toned, natural lighting (not studio)
- Blue overlay at 82–92% opacity unifies varied photography into brand palette
- No B&W, no heavy grain, no pure stock-photo sterility

### Animations & transitions
- Minimal. Subtle `fadeUp` on hero content (opacity + translateY, 0.5s ease)
- Hover: cards lift (`translateY(-2px)`) + shadow deepens
- No infinite loops or decorative motion
- Reduced-motion should always show final state

### Hover & press states
- **Buttons:** background darkens (primary → navy on hover)
- **Cards:** shadow elevates, slight Y lift
- **Links/nav:** no underline; color shift to `var(--color-primary)` on hover
- No opacity-only fades; favor color + elevation changes

### Cards
- Background: white
- Border-radius: `--radius-lg` (12px) for blog/content cards; `--radius-xl` (16px) for team/person cards
- Shadow: `--shadow-card` (very subtle); `--shadow-card-hover` on hover (blue-tinted)
- No left-border accents; no colored card headers
- Padding: `var(--space-6)` (24px) standard

### Borders
- 1.5px borders on form inputs
- `--color-border-default` (#D1D0CE) for dividers and card edges
- `--color-border-subtle` (#E8E6E6) for section dividers

### Corner radii
- Buttons: `--radius-md` (8px)
- Cards: `--radius-lg` (12px) / `--radius-xl` (16px)
- Pill badges/tags: `--radius-full`
- Hero image container: `--radius-2xl` (24px)

### Spacing & layout
- 4px base grid
- Section vertical padding: `80px`
- Container max-width: 1200px, centered, 32px side gutters
- Two-column grid (50/50 or 60/40) for hero, testimonial, portfolio
- Three-column grid for services, blog cards

### Shadows
Very subtle, almost flat — this is not a heavy-shadow design. Card shadows are barely perceptible at rest; only elevate on hover.

---

## Iconography

### Approach
CortanaTech uses **simple, outlined/monoline icons** rendered white on blue overlay backgrounds. Icons are not decorative; they serve as service identifiers in the Partner section.

### Icon style
- Monoline, outlined (not filled)
- Used at ~24–32px within a 48px container with rounded background
- On blue overlay: white icon on `rgba(255,255,255,0.15)` bg
- On white: blue icon (`--color-primary`) on `--color-blue-50` bg

### Icon systems
No bespoke icon font found in the branding materials. The site uses simple Unicode/emoji-proxied icons in the web version; a proper CDN icon set (e.g. **Lucide Icons** or **Heroicons**) is a recommended substitution for new interfaces, matching the outlined style seen on the website.

> **Recommendation:** Use [Lucide Icons](https://lucide.dev/) via CDN for new screens. The outlined style matches the brand's monoline icon treatment.

### Assets available
| Asset | Path |
|---|---|
| Logo on blue gradient bg | `assets/logos/logo-on-blue.png` |
| Full logo on white | `assets/logos/logo-on-white.png` |
| Icon / brandmark only | `assets/logos/icon-mark.png` |
| Dark wordmark on white | `assets/logos/logo-dark.png` |

---

## File Index

```
CortanaTech Design System
├── styles.css                      Global entry point — import this one file
├── readme.md                       This document
├── SKILL.md                        Agent skill definition
│
├── tokens/
│   ├── colors.css                  Brand blues, neutrals, semantic aliases, gradients
│   ├── typography.css              Typeface vars, size scale, weight, leading, tracking
│   ├── spacing.css                 4px grid, radii, container widths
│   ├── shadows.css                 Elevation scale + semantic shadows
│   └── fonts.css                  Google Fonts @import (Urbanist + DM Sans + DM Mono)
│
├── assets/
│   └── logos/
│       ├── logo-on-blue.png       Full logo on brand gradient
│       ├── logo-on-white.png      Full logo on white
│       ├── icon-mark.png          Brandmark only
│       └── logo-dark.png         Dark wordmark
│
├── guidelines/                    Foundation specimen cards (Design System tab)
│   ├── colors-brand.card.html    Primary blue scale
│   ├── colors-neutral.card.html  Neutral/gray scale
│   ├── colors-gradient.card.html Brand gradient treatments
│   ├── colors-semantic.card.html Status colors
│   ├── type-display.card.html    Display & heading type
│   ├── type-body.card.html       Body & UI text
│   ├── type-scale.card.html      Token reference table
│   ├── spacing-scale.card.html   Spacing tokens (visual)
│   ├── shadows-radius.card.html  Elevation + border-radius
│   ├── brand-logo.card.html      Logo variants
│   ├── brand-voice.card.html     Tone & copy style
│   └── brand-sections.card.html  Section background treatments
│
├── components/
│   ├── core/
│   │   ├── Button.(jsx|d.ts|prompt.md)       Primary action button
│   │   ├── Badge.(jsx|d.ts)                  Status/category label
│   │   ├── SectionHeader.(jsx|d.ts)          Eyebrow + heading block
│   │   ├── ServiceItem.(jsx|d.ts)            Icon + title + desc
│   │   ├── core.card.html                    Component preview card
│   │   └── buttons.card.html                 Button preview card
│   ├── cards/
│   │   ├── Card.(jsx|d.ts)                   Generic card wrapper
│   │   ├── BlogCard.(jsx|d.ts)               Blog post card
│   │   ├── TeamCard.(jsx|d.ts)               Team member card
│   │   └── cards.card.html                   Card preview
│   ├── forms/
│   │   ├── Input.(jsx|d.ts)                  Text/email input
│   │   └── forms.card.html                   Form preview
│   └── navigation/
│       ├── Navbar.(jsx|d.ts)                 Top navigation bar
│       └── navigation.card.html              Nav preview
│
└── ui_kits/
    └── website/
        └── index.html                        CortanaTech homepage UI kit
```

---

## Quick Start (Consuming Project)

```html
<!-- 1. Link the token stylesheet -->
<link rel="stylesheet" href="path/to/cortanatech-ds/styles.css">

<!-- 2. Load the component bundle -->
<script src="path/to/cortanatech-ds/_ds_bundle.js"></script>

<!-- 3. Use components -->
<script>
  const { Button, BlogCard, Navbar } = window.CortanaTechDesignSystem_bb1f31;
</script>
```

---

*For caveats and substitutions, see the SKILL.md file.*
