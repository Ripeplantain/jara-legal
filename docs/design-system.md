# jara-legal design system (v0.1)

Calm, trustworthy, a little editorial: it should feel like a well-made document tool for freelancers and small businesses, not a law firm and not a toy. Deep teal carries trust and action, saffron marks the moments that matter, and warm paper-toned neutrals keep long chats easy on the eyes.

**Source of truth:** [app/globals.css](../app/globals.css). This doc explains the values and how to use them. Live preview: `/design` (temporary, Phase 0b).

> **Defaults, not brand decisions.** The user asked me to pick, so everything here is a labeled default: the colors, the fonts, and the text-only wordmark `jara.legal` (Instrument Serif, saffron dot) are provisional until a real brand exists.

## How to use the tokens

- Use **semantic utilities** in components: `bg-primary`, `text-muted-foreground`, `bg-success-subtle text-success`, `shadow-sm`, `rounded-lg`, and so on.
- The raw palette (`--teal-600`, `--stone-200`, …) exists only so the semantic tokens can point at it. Don't use raw palette variables or hex values in components.
- Dark mode follows the OS setting. A script in `app/layout.tsx` toggles `.dark` on `<html>` before first paint. There's no in-app toggle yet. A `.light` class forces the light palette inside a dark page, which `/design` uses to show both side by side.

## Colors

### Palette

| Scale | Values |
|---|---|
| Teal (brand) | 50 `#EEF7F6` · 100 `#D5ECE9` · 200 `#AAD8D2` · 300 `#75BDB4` · 400 `#3F9C92` · 500 `#1F7F76` · **600 `#14675F`** · 700 `#10534D` · 800 `#0E433F` · 900 `#10302D` · 950 `#062220` |
| Saffron (accent) | 50 `#FFF8EB` · 100 `#FDEBC8` · 200 `#FBD58D` · 300 `#F8BA4F` · **400 `#F5A524`** · 500 `#E08A0B` · 600 `#B86A06` · 700 `#8A4F00` |
| Stone (warm neutral) | 0 `#FFFFFF` · 25 `#FCFBF8` · 50 `#F7F5F0` · 100 `#EFECE5` · 200 `#E3DFD6` · 300 `#CDC7BB` · 400 `#A59E91` · 500 `#8F887B` · 550 `#6E675C` · 600 `#5E584E` · 700 `#47423A` · 800 `#2F2B26` · 850 `#2A2621` · 900 `#1F1C18` · 950 `#141210` |

### Semantic tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` / `foreground` | stone-25 / stone-900 | stone-950 / `#F2EFE9` | Page and body text |
| `card`, `popover` | white | stone-900 | Raised surfaces |
| `muted` / `muted-foreground` | stone-50 / stone-600 | stone-850 / stone-400 | Quiet panels, secondary text, metadata |
| `secondary` | stone-100 / stone-800 | stone-800 / `#F2EFE9` | Secondary buttons |
| `accent` | teal-50 / teal-700 | teal-900 / teal-200 | Hover rows, selected chat, icon chips |
| `primary` / `primary-hover` | teal-600 / teal-700 | teal-300 / teal-200 | Main action, links, focus |
| `primary-foreground` | white | teal-950 | Text on primary |
| `highlight` | saffron-400 on stone-900 | same | "New", one key moment per screen. **Never as text color on light backgrounds.** |
| `success` / `-subtle` | `#1E7A45` / `#E8F5EC` | `#6FCF97` / `#12301F` | Generated, saved |
| `warning` / `-subtle` | saffron-700 / `#FFF4DE` | saffron-300 / `#33240A` | Needs info, placeholder legal text |
| `info` / `-subtle` | `#1D5FA8` / `#E8F0FB` | `#8AB8F0` / `#13263D` | Ready to confirm, neutral notices |
| `destructive` / `-subtle` | `#B42318` / `#FDECEA` | `#F28B82` / `#3A1714` | Errors, delete |
| `border` | stone-200 | stone-800 | Dividers, card edges |
| `input` | stone-500 | stone-550 | Form field borders (needs 3:1) |
| `ring` | teal-500 | teal-300 | Focus ring |
| `bubble-user` | teal-600 / white | teal-300 / teal-950 | The user's chat bubbles |

Status colors always come with a word and usually an icon (✓ Generated, ⚠ Placeholder legal text), so color is never the only signal.

### Measured contrast (WCAG 2.2)

Measured 2026-10-02 with a relative-luminance script. Text pairs need 4.5:1 (AA); input borders and focus rings need 3:1.

| Pair | Light | Dark |
|---|---:|---:|
| Body text on background | 16.40 | 16.28 |
| Body text on card | 16.97 | 14.79 |
| Muted text on background | 6.81 | 7.03 |
| Muted text on muted | 6.46 | 5.65 |
| Primary button text | 6.70 | 7.71 |
| Primary hover button text | 8.87 | — |
| Primary as link on background | 6.47 | 8.63 |
| Secondary button text | 11.91 | 12.24 |
| Accent text on accent | 8.14 | 9.08 |
| Text on highlight (saffron) | 8.31 | 8.31 |
| Destructive text on background | 6.35 | 7.82 |
| Destructive on subtle | 5.75 | 6.70 |
| Success on subtle | 4.77 | 7.52 |
| Warning on subtle | 6.02 | 8.68 |
| Info on subtle | 5.62 | 7.43 |
| User bubble text | 6.70 | 7.71 |
| Input border vs card (3:1) | 3.51 | 3.04 |
| Focus ring vs background (3:1) | 4.66 | 8.63 |

All pass. Two are close to the line: light success (4.77) and dark input border (3.04). Re-measure if you change them. Disabled controls (50% opacity) are exempt from contrast rules and intentionally fall below them.

## Typography

| Role | Font | Why |
|---|---|---|
| Display | **Instrument Serif** 400 (OFL, Google Fonts) | Editorial, document-like titles. It has a single weight, so use it only at `text-section` size or larger, never bold. |
| UI and body | **Geist** (OFL) | Clean and very readable at 14–16px. shadcn's `font-heading` also maps here, so component titles stay Geist. |
| Numbers | **Geist Mono** with `tabular-nums` | Amounts, invoice numbers, rates, and dates in tables. |

All three load through `next/font/google`, so they're self-hosted with no external request at runtime.

| Utility | Font | Size / line | Weight | Use |
|---|---|---:|---|---|
| `font-display text-display` | Instrument Serif | 44 / 48 | 400 | Empty-state hero ("Your NDA, in a few questions.") |
| `font-display text-title` | Instrument Serif | 32 / 40 | 400 | Page titles, document titles |
| `font-display text-section` | Instrument Serif | 24 / 32 | 400 | Section titles |
| `text-lg font-semibold` | Geist | 18 / 28 | 600 | Card and panel titles |
| `text-base` | Geist | 16 / 24 | 400 | Chat messages |
| `text-sm` | Geist | 14 / 20 | 400 | UI default, form labels, table cells |
| `text-xs` | Geist | 12 / 16 | 400–500 | Helper text, metadata, badges |
| `font-mono tabular-nums` | Geist Mono | inherits | 400 | Money and IDs |

## Spacing

Tailwind's 4px base scale is used unchanged. Common steps:

- 8px inside controls
- 12px for compact cards and badge gaps
- 16px for card padding
- 24px between groups
- 40px between page sections

Layout targets for the coming phases:
- the chat column at `max-w-3xl` (768px), centered
- the sidebar at 280px
- the composer pinned to the bottom with 16px insets

## Radius and shadows

`--radius` is `0.75rem` (12px). shadcn derives the other sizes from it:

| Token | Size | Use |
|---|---:|---|
| `rounded-sm` | 7.2px | Small chips |
| `rounded-md` | 9.6px | Swatches, small elements |
| `rounded-lg` | 12px | Buttons, inputs, document icon chips |
| `rounded-xl` | 16.8px | Cards, document cards |
| `rounded-2xl` | 21.6px | Chat bubbles, the composer |

The user bubble squares off its bottom-right corner (`rounded-br-md`) to point at the sender.

| Token | Light | Use |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgb(31 28 24 / .05)` | Inputs on tinted panels |
| `shadow-sm` | `0 1px 3px / .08` + `0 1px 2px / .04` | Cards, document cards |
| `shadow-md` | `0 4px 12px / .08` + `0 2px 4px / .04` | Composer, popovers |
| `shadow-lg` | `0 12px 32px / .12` + `0 4px 8px / .05` | Dialogs |

Light shadows are tinted warm (stone-900). Dark mode uses stronger black shadows, which are mostly invisible, so dark surfaces separate by color step instead (background → card → secondary).

## Icons

- Library: **lucide-react**, already a shadcn dependency.
- Style: outline at the default 2px stroke.
- Sizes: 16px inside buttons and badges (set automatically, 12px in badges) and 20px in document chips.
- Domain icons: `FileTextIcon` for NDAs, `ReceiptIcon` for invoices, `CheckIcon` for generated, `TriangleAlertIcon` for placeholder or needs-info, `DownloadIcon`, and `ArrowUpIcon` for send.

## Components

All live in `components/atoms` (shadcn primitives) unless noted. Atoms are styled only through tokens.

**Buttons:**
- `default` is the primary action. Use one per view, e.g. "Confirm and generate" or the send button. Hover uses `primary-hover`, not opacity, so text contrast stays at the measured value.
- `secondary`, `outline`, `ghost`, `link` and `destructive` cover the rest.
- Sizes are `sm` (28px), `default` (32px), `lg` (36px) and `icon`.
- Loading state: disabled, with a spinning `LoaderCircleIcon` and a verb ("Generating…").

**Inputs:** label above, helper text below in `text-xs text-muted-foreground`. For errors, set `aria-invalid` and turn the helper text `text-destructive`, saying how to fix it ("Enter a number, e.g. 15."). Disabled inputs get a muted fill.

**Status badges** (Badge variants):

| Variant | Use |
|---|---|
| `secondary` | Draft |
| `warning` | Needs info |
| `info` | Ready to confirm |
| `success` + ✓ | Generated |
| `warning` + ⚠ | Placeholder legal text |
| `highlight` | New |
| `destructive` | Failed |

**Chat (molecules and organisms, Phase 4):**
- **User message:** right-aligned bubble, `bg-bubble-user text-bubble-user-foreground rounded-2xl rounded-br-md`, max 80% width.
- **Assistant message:** no bubble, plain `text-base` on the background, max 85% width, so the conversation reads like a document.
- **Confirm summary card:** a card with a `dl` of every field and Confirm + "Change something" in the footer. The description repeats that nothing is generated until you confirm.
- **Document card:** icon chip (accent for NDA, warning-subtle for invoice), file name, and a meta line that includes "template, not legal advice". Download is an outline button; status is a badge.
- **Composer:** `rounded-2xl bg-card shadow-md` with a borderless textarea and the icon send button.

**PDFs (Phase 3):** use a restrained version. Teal-600 for the title rule and stone-900 for text on white. Instrument Serif for the document title only, if it embeds cleanly in `@react-pdf/renderer`; otherwise Helvetica. Print readability comes first.

## Principles

1. **The document is the hero.** Chrome stays quiet so the NDA or invoice taking shape gets the attention.
2. **One loud thing per screen.** Saffron and the primary button mark the single next step, usually Confirm.
3. **Never only color.** Every status has a word, and most have an icon.
4. **Honest by design.** "Template, not legal advice" and the placeholder-text badge are part of the UI, not fine print.
5. **Numbers line up.** Money and IDs use mono tabular figures everywhere.
