---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/Inbox.tsx","src/MessageForm.tsx"]
---

# Demo screen (form + inbox)

Mode: operate. Audience: recruiters and developers trying the demo for about a minute (see PRODUCT.md).
Job: write or pick a customer message, then read what the AI did with it and why it can be trusted.
Constraints: keep the business select inside the form (it locks while sending), keep every existing label the tests and screen readers rely on, privacy notice visible next to the form, UI in Rioplatense Spanish.

## Direction contract

THESIS: The AI's draft is a sticky note left on the message, something to review, never a sent reply. Refuses the generic three-pane SaaS inbox and the chatbot transcript.

OWN-WORLD: Cool white surfaces on a #f3f5f9 ground, indigo-black ink #1b1f3b, one indigo action colour #4f46e5. Priority is a coloured index flag on the card edge (urgent #e5484d, high #f5a524, normal indigo, low slate) and colour means priority only. The draft is a flat sticky-note yellow #ffe066 block with a folded corner radius. Figtree, a strict scale with large contrast between headings and labels; 8 px grid.

STORY: The visitor sees a headline that says what to do, picks a suggestion or writes, sends, and the new message lands at the top of "Mis mensajes" with its flag, category, needs-human chip, extracted data and the yellow draft note.

FIRST VIEWPORT: Dark indigo-black top bar with the product name. Left column (about 448 px): two-line headline, short lede, white form card with business select, optional name/email, suggestion chips, message textarea, counter and the indigo submit button, privacy note. Right column: "Mis mensajes" with large muted count, flagged message cards; an open analysis lifts its card with a soft shadow; "Ejemplos" below.

FORM: Tablero de notas (office wall of sticky notes and index flags), grounded list position 7 of 7, assigned by the roll. Signature move: the draft rendered as a sticky note, and priority as an index flag on the card edge. Raises: scale-contrast hierarchy, progressive disclosure on the open card, one visual variable per meaning, nothing labelled twice, one 8 px grid. seed:2e819366bbc86c12

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
