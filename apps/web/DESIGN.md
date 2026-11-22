---
name: AI Inbox Triage
description: A notice board where every message carries a priority flag and the AI's draft is a sticky note left for a person to review.
colors:
  accent: "#4f46e5"
  accent-hover: "#4338ca"
  accent-soft: "#eeedff"
  accent-ink: "#3730a3"
  accent-on-ink: "#b4b0ff"
  ground: "#f3f5f9"
  surface: "#ffffff"
  ink: "#1b1f3b"
  ink-2: "#4a5072"
  ink-3: "#5f6584"
  line: "#e1e5ee"
  line-strong: "#878da8"
  error: "#b42318"
  urgent: "#e5484d"
  high: "#f5a524"
  normal: "#4f46e5"
  low: "#8b93a7"
  note: "#ffe066"
  note-ink: "#3d3300"
typography:
  display:
    fontFamily: "Figtree Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(1.75rem, 1.25rem + 1.5vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Figtree Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Figtree Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Figtree Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Figtree Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.5
  note-label:
    fontFamily: "Figtree Variable, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1.5
    letterSpacing: "0.03em"
rounded:
  flag: "3px"
  note-tip: "4px"
  chip: "6px"
  control: "10px"
  m: "12px"
  l: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
  4xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.surface}"
  button-primary-disabled:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-link:
    textColor: "{colors.accent-ink}"
    typography: "{typography.body-small}"
    padding: "0 4px"
    height: "32px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  suggestion:
    textColor: "{colors.ink-2}"
    typography: "{typography.body-small}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  suggestion-hover:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-ink}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.l}"
    padding: "24px"
  message-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    padding: "16px 20px 16px 28px"
  priority-flag:
    backgroundColor: "{colors.low}"
    rounded: "{rounded.flag}"
    width: "12px"
    height: "28px"
  draft-note:
    backgroundColor: "{colors.note}"
    textColor: "{colors.note-ink}"
    typography: "{typography.body-small}"
    padding: "12px 16px 16px"
  human-chip:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "1px 8px"
  topbar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.title}"
    height: "56px"
---

# Design System: AI Inbox Triage

## Overview

**Creative North Star: "The Notice Board"**

An office wall of index cards and sticky notes, rendered on a cool, bright screen. Each incoming message is a white card pinned to a pale blue-grey ground, with a coloured index flag sticking out of its left edge that says how urgent it is. When the AI has drafted a reply, the draft is a flat yellow sticky note left on that card: something a person picks up and reviews, never a reply that was already sent. The sticky note and the index flag are the system's two signature devices, and everything around them stays quiet so they read first.

Density is calm and legible rather than compact. A single heavy sans (Figtree at weight 800 for headings) does the hierarchy through strong size and weight contrast against small bold labels; there is no second typeface. Colour is rationed: one indigo for actions and links, a fixed four-colour priority set for the flags, and the note yellow. Everything else is ink, grey, and white. The world refuses the generic three-pane SaaS inbox and the chatbot transcript; the build has no sidebar, no chat bubbles, and no avatars.

Light only. The root declares `color-scheme: light` on purpose: the bright, high-contrast board is the identity, and there is no dark theme.

**Key Characteristics:**
- Cool white cards on a pale blue-grey ground, under a dark indigo-black top bar.
- Priority shown as an index flag tab on the card edge, and only there.
- The AI draft is a yellow sticky note with one rounded "curled" corner.
- One typeface, Figtree Variable, with heavy 800-weight headings and 700-weight labels.
- Flat surfaces; a soft lift shadow appears only on the card whose analysis is open.

## Colors

A cool neutral board with one indigo action colour, a strict priority quartet, and one warm note yellow.

### Primary
- **Board Indigo** (accent): the only action colour. Fills the submit button, draws focus rings, sets the caret and native accent colour, and outlines hovered suggestions. Its deeper **Pressed Indigo** (accent-hover) is the submit hover state.
- **Indigo Ink** (accent-ink): indigo text on light surfaces: links, the "Ver análisis" disclosure, the "Copiar" link button, hovered suggestion text, and the disabled submit label.
- **Indigo Wash** (accent-soft): the pale indigo fill behind hovered suggestions and the disabled (countdown) submit button.
- **Lavender on Ink** (accent-on-ink): only on the dark top bar, for the "Triage" half of the product name.

### Secondary
- **Sticky Note Yellow** (note): the draft reply's background, nothing else. Paired with **Note Ink** (note-ink), a dark olive brown for the note's text.

### Tertiary (priority flags)
- **Urgent Red** (urgent): the urgent flag.
- **High Amber** (high): the high-priority flag.
- **Normal Indigo** (normal): the normal flag. It shares the accent's value; on a card it appears only as the flag shape, so it never reads as an action.
- **Low Slate** (low): the low-priority flag and the flag's default.

### Neutral
- **Board Ground** (ground): the page background, and the disabled select's fill.
- **Card White** (surface): cards, the form panel, inputs, and text on dark or indigo fills.
- **Indigo-Black Ink** (ink): body text, headings, the top bar background, and the priority word on each card.
- **Second Ink** (ink-2): the lede, card tags, suggestion text, input hover borders.
- **Third Ink** (ink-3): metadata, placeholders, the counter, extracted-data keys, "(opcional)", the privacy note.
- **Hairline** (line): card, panel and suggestion borders, and the rule above the privacy note.
- **Strong Line** (line-strong): input and select borders, the "Requiere humano" chip border, the dashed empty state, the retry button border.
- **Alert Red** (error): form errors, the over-limit counter, and an invalid textarea border. It is darker than Urgent Red and is never used for a flag.

### Named Rules
**The Colour Is Priority Rule.** Inside the inbox, colour carries one meaning: priority, shown on the flag. Category tags and the "Requiere humano" chip stay neutral ink and grey. New inbox signals get a neutral treatment or a shape, never a new hue.

**The One Yellow Rule.** Sticky Note Yellow belongs only to AI drafts awaiting review. Don't use it for highlights, warnings or callouts.

## Typography

**Display Font:** Figtree Variable (with system-ui, -apple-system, Segoe UI, sans-serif)
**Body Font:** Figtree Variable, the same family
**Label/Mono Font:** none distinct; numbers use `font-variant-numeric: tabular-nums` in the counter, the list counts and the submit countdown.

**Character:** One friendly geometric sans carries everything, with hierarchy coming from weight and size contrast. Headings sit at 800 with tight negative tracking; labels are small and bold; body is plain 400. The font is bundled through @fontsource, so the app makes no third-party font requests.

### Hierarchy
- **Display** (800, fluid 1.75rem to 2.25rem, 1.1): the page headline only, two lines with each sentence forced onto its own line.
- **Headline** (800, 1.25rem, 1.2, -0.01em): list headings ("Mis mensajes", "Ejemplos"), followed by a large muted count.
- **Title** (800, 1.125rem, 1.2): the form card heading and the product name in the top bar.
- **Body** (400, 1rem, 1.5): message text, the lede (capped at 46ch), inputs. Extracted values use weight 600.
- **Body small** (400, 0.875rem): suggestions, the analysis area, the draft text (line-height 1.55), status and error lines.
- **Label** (700, 0.8125rem): form labels, disclosure summaries, card tags (the tags themselves are 400 in ink-2; the priority word is 800 in ink), the counter and privacy note at 400.
- **Note label** (800, 0.75rem, 0.03em, uppercase): only the sticky note's warning line, "Borrador: revisar antes de enviar". It is a functional caution on the draft, not a section kicker.

### Named Rules
**The Weight Ladder Rule.** Hierarchy steps through 800 headings, 700 labels, 600 values and 400 text. Don't add a second typeface or decorative styles to create emphasis.

## Layout

A centred container with a 1200px maximum width, 24px side padding (16px on narrow screens), 32px top and 64px bottom padding. Below a 56px top bar, the main area is a two-column grid at a 5:7 ratio with a 48px gap, aligned to the top: the compose column (headline, lede, form card) on the left and the inbox on the right. At 820px and below the grid becomes a single column with a 40px gap, the form first.

Spacing runs on 4px steps, with 8px multiples doing most of the work: 8px between list cards and form elements, 12px between a label and the previous field, 16px inside cards and around the privacy rule, 24px panel padding, 40px between inbox sections. The compose column's 20px gap and the cards' 20px right padding are the two off-grid values in the build.

Inside an open card, extracted data and the draft note sit side by side and wrap to stacked when there is no room, with the note taking the wider share. At 1440x900 the submit button ends at the fold and the privacy note sits just below it; that was reviewed and accepted.

## Elevation & Depth

Mostly flat, with tonal layering doing the work: white cards on the grey-blue ground, separated by hairlines. Two shadows exist. The form panel has a near-invisible 1px contact shadow. The only real lift belongs to state: when a card's analysis is opened, its border disappears and it rises on a soft, ink-tinted shadow, eased in over 0.3s. The draft note itself rests flat; on opening, it settles onto the card from 6px above, shedding a brief warm shadow over 0.45s, and the animation is removed under reduced motion.

### Shadow Vocabulary
- **Contact** (`box-shadow: 0 1px 2px rgb(27 31 59 / 0.05)`): the form panel at rest.
- **Lift** (`box-shadow: 0 12px 28px -12px rgb(27 31 59 / 0.28)`): the message card whose analysis is open. Nothing else.
- **Stick** (`box-shadow: 0 10px 18px -8px rgb(61 51 0 / 0.35)`): only the first keyframe of the note's settling animation; never at rest.

### Named Rules
**The Lift Means Open Rule.** A card lifts only while its analysis is open. Resting cards stay flat with a hairline border.

## Shapes

Soft rectangles throughout: 16px for the form panel, 12px for message cards and the empty state, 10px for every control (inputs, selects, suggestions, buttons), 6px for the "Requiere humano" chip, 3px for the flag tab. The sticky note breaks the pattern deliberately: three near-square 4px corners and one 16px bottom-left corner, like a note whose corner curls. The index flag is a 12 x 28px tab that hangs 6px past the card's left edge. Disclosure chevrons are drawn with CSS borders rotated 45 degrees, not icon glyphs.

**The Curled Corner Rule.** Only the draft note gets the asymmetric corner; every other surface keeps uniform radii.

## Components

### Buttons
Confident and plain, one primary per screen.
- **Shape:** gently rounded (10px), at least 48px tall.
- **Primary:** Board Indigo fill, white 700-weight text, 12px 20px padding, full width in the form.
- **Hover / Focus:** hover deepens to Pressed Indigo over 0.15s; active nudges down 1px; focus shows the global 2px indigo outline offset 2px.
- **Disabled:** never greyed out. It turns Indigo Wash with Indigo Ink text so the countdown between messages stays readable on the button.
- **Secondary (retry):** white with a Strong Line border and bold ink text; hover switches the border to indigo and the text to Indigo Ink.
- **Link button ("Copiar"):** no fill, Indigo Ink 700 text, 32px tall, underlines on hover.

### Chips
- **"Requiere humano":** neutral on purpose: no fill, Strong Line 1px border, 6px radius, bold ink text. It sits inline with the tags.
- **Card tags:** the priority word in 800 ink, then the category in ink-2, separated by a middle dot that belongs to the following tag so a wrapped line never ends on a dot.

### Suggestions
Full-width one-line rows under the label "¿No sabés qué escribir?": transparent fill, hairline border, 10px radius, ink-2 text, truncated with an ellipsis. Hover turns the border indigo, the fill Indigo Wash and the text Indigo Ink. A click puts the full text in the message field.

### Cards / Containers
- **Form panel:** white, hairline border, 16px radius, 24px padding, contact shadow.
- **Message card:** white, hairline border, 12px radius, 16px 20px 16px 28px padding (the extra left room clears the flag). Open state: no border, Lift shadow.
- **Empty state:** dashed Strong Line border, 12px radius, 20px 24px padding.

### Inputs / Fields
- **Style:** white fill, 1px Strong Line border, 10px radius, 10px 12px padding. The select has a custom ink chevron and 600-weight text.
- **Hover:** border darkens to ink-2.
- **Focus:** border turns indigo, outline sits flush (offset 0).
- **Error / Disabled:** invalid textarea gets an Alert Red border; the disabled select (while sending) takes the Board Ground fill, ink-2 text and a not-allowed cursor.
- **Counter:** right-aligned tabular figures in ink-3, Alert Red when over the limit.
- **Disclosure ("Agregar nombre y email", "Ver análisis"):** a 32px-tall summary with a rotating border chevron (0.2s). The sender disclosure is ink; the analysis disclosure is Indigo Ink.

### Navigation
- **Top bar:** a full-width Indigo-Black Ink band, 56px tall, holding only the product name in 800 weight, with "Triage" in Lavender on Ink. No links or menus.

### Priority Flag (signature)
A 12 x 28px tab with 3px radius, positioned 6px outside the card's left edge and 14px from its top, coloured by priority: Urgent Red, High Amber, Normal Indigo, Low Slate. It is decorative to assistive tech; the priority word in the tags carries the meaning in text.

### Draft Note (signature)
The AI's reply rendered as a sticky note: Sticky Note Yellow fill, Note Ink text, 12px 16px 16px padding, the curled bottom-left corner. A header row holds the uppercase note label and the "Copiar" link button; the label stays on one line, and "Copiar" wraps below it when the note is narrow. Escalated messages have no note at all.

## Do's and Don'ts

### Do:
- **Do** show priority with the index flag on the card edge, in exactly the four priority colours.
- **Do** render every AI draft as the yellow sticky note with the curled corner, labelled as a draft to review.
- **Do** keep category tags and the "Requiere humano" chip neutral (ink, ink-2, Strong Line).
- **Do** keep a disabled primary button readable (Indigo Wash with Indigo Ink) when it carries a countdown.
- **Do** reserve the Lift shadow for the card whose analysis is open.
- **Do** use the 10px radius for every control and the 4px spacing steps, favouring 8px multiples.
- **Do** keep motion short and eased with `cubic-bezier(0.16, 1, 0.3, 1)`, and drop the note's animation under reduced motion.

### Don't:
- **Don't** use colour for anything else in the inbox: categories, statuses and flags beyond priority get no hue.
- **Don't** use Sticky Note Yellow outside AI drafts, and don't use Alert Red for a priority flag.
- **Don't** build the three-pane SaaS inbox (sidebar, list, reading pane) or a chatbot transcript with bubbles and avatars.
- **Don't** add a second typeface or a dark theme; the system is light only.
- **Don't** put resting shadows on message cards.
