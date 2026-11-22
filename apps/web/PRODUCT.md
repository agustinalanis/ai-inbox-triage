# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: recruiters, tech leads and developers who arrive from LinkedIn or the GitHub repository to judge the author's skill at building LLM applications. They spend about a minute in the demo, playing the role of a customer who writes to a small business, and need to understand at a glance what the AI did with the message and why it can be trusted.

The staff of a small business (a medical office receptionist, a college's admin office) is the scenario the demo portrays, not the audience it is designed for.

## Product Purpose

AI Inbox Triage classifies each incoming message into the business's own categories, sets a priority, extracts the data the staff needs and drafts a reply for a person to review. The demo exists to back a CV claim ("I can integrate and work with LLMs") with a public, working project. Success: a visitor understands the triage result, sees the engineering behind it and leaves with a clear impression of the author's judgment.

## Positioning

The interesting part is not the API call but making the output trustworthy: critical rules enforced in code, a per-business output schema, evals on labeled datasets and protection of a free-tier quota.

## Operating Context

- Anonymous per-visitor inbox (UUID session in localStorage); no login.
- Two sample businesses ship as JSON configs: a medical office (`consultorio`) and a college (`academia`). Each has its own categories, extracted fields and suggested messages.
- Each new session gets seeded example messages, shown apart from the visitor's own.
- Sending is paced: a countdown between messages, a per-IP rate limit and a daily cap; texts are limited to 1,000 characters.
- Provider failures fall back to human review; the message is never lost.
- Visitors arrive on desktop (from LinkedIn or GitHub) and on mobile (from the LinkedIn app).

## Capabilities and Constraints

- Per message: category, priority (urgent, high, normal, low), "needs a human" flag, extracted data with business labels and an optional draft reply with a copy action.
- Escalated categories (a medical crisis, a student at risk) always get urgent priority, needs-human and no draft.
- React 19 SPA with plain CSS, Vite; API in NestJS. Public deploy is pending.
- Font loading via @fontsource (bundled, no third-party requests), chosen by the user.

## Brand Commitments

- Product name: "AI Inbox Triage".
- UI copy in Rioplatense Spanish; code and docs in English.
- The privacy notice (messages are processed by Google Gemini on the free tier; do not write real personal data) stays visible next to the form.

## Evidence on Hand

- Eval results in the repository README: 45 labeled cases across two businesses, three runs on 2026-11-20. Do not overstate them beyond what the README says.
- Screenshots in `docs/screenshots/`.
- No testimonials, customers or production usage exist; never fabricate them.

## Product Principles

1. The AI proposes and a person decides: replies are always drafts for review.
2. Critical rules, such as escalating an emergency, are guaranteed by code, not by the model.
3. Honesty about limits: disclose processing by Google and never exaggerate metrics.
4. Zero friction: no login, examples ready to try.
