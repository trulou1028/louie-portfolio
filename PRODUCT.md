# Product

Derived from `LOUIE_PORTFOLIO_V2_IMPLEMENTATION_SPEC.md` (§1, §2, §5, §38) and
`AGENTS.md`. The spec stays authoritative; this file is the short design brief
that the Impeccable design skill reads before any design work.

## Register

brand

## Users

- **Recruiters and sourcers.** Often not designers. They open the link from a
  LinkedIn message or an applicant tracking system, between other tasks. They
  scan for about 8 to 10 seconds: role, companies, scope, and whether the work
  looks senior.
- **Hiring managers at AI product companies** (design managers, product leads,
  founders). They read one case study in depth. They look for judgment on AI
  behavior, ownership from strategy to shipped product, and evidence.
- **Senior designers on the interview loop.** They judge craft: type, layout,
  detail, motion, and whether the portfolio itself is well designed.

## Product Purpose

`louiesakoda.com` gets Louie Sakoda hired as a senior or lead product designer
for AI products. Within 10 seconds a recruiter must understand that Louie
designs AI products, thinks in systems and workflows, has deep product design
experience, and can build working software (spec §1).

Visitors browse normally or ask AI Louie, which answers only from a curated
evidence index and links to the source. Success is a booked conversation.

## Brand Personality

Clear, exact, and quietly confident. The site should feel like someone who
makes hard decisions easy to see. Emotional goals: trust first, then interest.
Confidence comes from real work and restraint, not from effects.

## Anti-references

- Startup landing-page tropes, SaaS hero-metric blocks, and template sections.
- Excessive gradients, glassmorphism, decorative dashboards, and loud motion.
- Obvious shadcn defaults.
- Generic "AI" styling: purple glow, orbs, particles, and sparkle icons as
  decoration.
- Showreel intros that delay access to the work.
- Invented content of any kind: metrics, quotes, redrawn product UI, or fake
  outcomes.

## Design Principles

1. **The work is the hero.** Product screenshots and real artifacts carry the
   page. The shell supports them.
2. **Show the decision.** Every visual and every animation should make a
   decision or a state change visible.
3. **Practice what you preach.** A portfolio about clear decisions must be
   clear itself: fast to scan, easy to navigate, and honest.
4. **Evidence over adjectives.** Every claim links to proof. No fabricated
   facts.
5. **Restraint with a point of view.** Quiet does not mean generic. One strong
   idea per view.

## Accessibility & Inclusion

WCAG 2.1 AA. Body text at 4.5:1 contrast minimum. Full keyboard support with
visible focus. Every animation has a `prefers-reduced-motion` alternative, and
no content stays hidden while scripts load. Mobile is a first-class layout.
