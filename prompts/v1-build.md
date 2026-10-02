# v1 build — chat-based NDA and invoice generator

Source: [AGENTS.md](../AGENTS.md) (Product Scope, How It Works, Stack, rules). This prompt builds v1 from an empty repo to a Dockerized app where a signed-in user can chat their way to a downloadable NDA or invoice PDF.

Work goes in **eight phases**: 0 (scaffold), 0b (design tokens), 1–5 (the app), and 6 (Docker). I stop after each phase, report what was verified, and wait for you before starting the next one. Nothing outside AGENTS.md's v1 scope gets built: no email sending, e-signatures, payments, or currency conversion.

Latest versions checked 2026-10-01: Next.js 16.3, AI SDK 7 (`ai` 7.0 / `@ai-sdk/react` 4.0), `@openrouter/ai-sdk-provider` 3.1, Better Auth 1.7, drizzle-orm 0.45 / drizzle-kit 0.31, better-sqlite3 13, Zod 4, `@react-pdf/renderer` 4.9, Tailwind 4, shadcn 4. I'll install current versions and check each library's docs (Context7) before writing its code.

---

## Phase 0 — Scaffold

**Files:** `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `components.json`, `app/layout.tsx`, `app/globals.css`, `.gitignore`, `.env.example`, `README.md`.

- `create-next-app` with TypeScript, App Router, Tailwind, ESLint, pnpm, **no `src/` dir** (AGENTS.md paths are root-level: `app/`, `components/`, `server/`).
- `shadcn init`, with the `ui` alias in `components.json` pointed at `components/atoms`.
- `package.json` scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `db:generate`, `db:migrate`.
- `.gitignore` adds `*.db`, `*.db-journal`, `*.db-wal`, `*.db-shm`, `/data`, `.env*` (except `.env.example`).
- `.env.example`: `DATABASE_PATH`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`. No `NEXT_PUBLIC_` secrets.
- `git init` if you want it (the folder isn't a repo yet). I won't commit unless you ask.

## Phase 0b — Design tokens

**Skill:** `design-system-builder` (global). **Files:** `app/globals.css`, `docs/design-system.md`, `AGENTS.md` (UI Rules).

- Run the skill's intake first, using your answers to assumption 10 below. Then produce tokens for:
  - colors: brand, neutrals, surfaces, text, border, and success / warning / danger / info
  - typography: font pair and type scale with sizes and line heights
  - spacing scale
  - radius
  - shadows
  - component states for buttons, inputs, badges, cards, chat bubbles, and the document card
- **Token format matches the toolchain.** Tokens are CSS variables in `app/globals.css`, exposed to Tailwind 4 through `@theme`. shadcn's theme variables (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`, …) map to them, so shadcn atoms pick up the brand with no per-component overrides. There's no separate token JSON unless you want one for design tools.
- **Light and dark** palettes, if you want dark mode (assumption 10). Core text and control pairs meet WCAG AA contrast, and I'll report the measured ratios rather than claim them.
- Fonts load through `next/font`, and only fonts with a real open license (e.g. from Google Fonts).
- `docs/design-system.md` is the written spec: exact values, usage rules, and the chat- and document-specific components. AGENTS.md's UI Rules will point to it as the token source, replacing "shadcn's theme tokens."
- The feel targets the product: a calm, trustworthy, professional tool for freelancers and small businesses, not a law-firm look.

**Verify:** a temporary `/design` page renders every token and atom state in light and dark, for you to review. I'll delete it, or keep it behind auth, whichever you prefer. Also check contrast ratios for core pairs.

## Phase 1 — Database and auth

**Files:** `drizzle.config.ts`, `server/db/client.ts`, `server/db/schema/auth.ts`, `server/auth/auth.ts`, `server/auth/session.ts`, `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`, `proxy.ts`, `app/(auth)/sign-in/page.tsx`, `app/(auth)/sign-up/page.tsx`, auth atoms/molecules/organisms/template, first migration in `drizzle/`.

- Drizzle client on `better-sqlite3` at `DATABASE_PATH` (default `./data/app.db`), created once, with `PRAGMA foreign_keys = ON` and `PRAGMA journal_mode = WAL`. All `server/` modules start with `import "server-only"`.
- Better Auth with the Drizzle adapter and **email/password only**, following the installed `better-auth-best-practices` and `email-and-password-best-practices` skills. Its tables are generated into `server/db/schema/auth.ts` with the Better Auth CLI, then migrated with drizzle-kit. No email verification or password reset (no email provider in v1).
- `server/auth/session.ts` exports `requireUser()`, which returns the session user or throws a 401-style error. Every later entry point calls it first.
- `proxy.ts` only does an optimistic redirect of signed-out users to `/sign-in`. Real checks stay in each route and action, per AGENTS.md.
- Sign-up and sign-in pages built from atoms → molecules → organisms → an auth template.

**Verify:** sign up, sign out, sign in, confirm signed-out access to `/` redirects, confirm the session cookie is `httpOnly`.

## Phase 2 — App data layer

**Files:** `server/db/schema/app.ts`, `server/profile/`, `server/clients/`, `server/chats/`, `server/documents/`, migration.

Tables (text UUID ids, integer timestamps, explicit `onDelete`):

| Table | Key columns |
|---|---|
| `business_profiles` | `userId` (unique), name, business name, address, email, phone, optional tax ID |
| `clients` | `userId`, name, company, email, address |
| `chats` | `userId`, title, created/updated |
| `chat_messages` | `chatId`, role, `parts` (JSON of AI SDK message parts), created |
| `drafts` | `chatId` (unique), `userId`, `docType` (`nda` \| `invoice`), `fields` (JSON), updated |
| `documents` | `userId`, `chatId`, `clientId?`, `docType`, `fields` (confirmed JSON snapshot), `templateVersion`, `filePath`, `invoiceNumber?`, `totalMinor?`, `currency?`, `relatedNdaId?`, created |

- Unique index on (`userId`, `invoiceNumber`). The number is `max + 1` for that user, computed inside the same transaction that inserts the invoice.
- Invoice line items live in the `fields` snapshot rather than their own table: nothing in v1 queries individual line items.
- Every `server/<feature>` function takes `userId` as its first argument and filters by it internally. They return DTOs, not rows.

**Verify:** migration applies cleanly to a fresh DB; a short script inserts two users' data and confirms neither user's functions return the other's rows.

## Phase 3 — Document schemas and PDF templates

**Files:** `server/documents/schemas/nda.ts`, `server/documents/schemas/invoice.ts`, `server/documents/templates/nda.tsx`, `server/documents/templates/invoice.tsx`, `server/documents/render.ts`, `server/documents/money.ts`.

- One Zod schema per document type, plus a `.partial()` version for drafts.
  - NDA: `kind` (`one-way` \| `mutual`), disclosing/receiving party (one-way) or both parties (mutual), project scope, confidentiality term, effective date, governing location as **free text the user enters** (no legal guidance).
  - Invoice: issuer (from profile), client, line items (description, quantity, unit price in minor units), currency (ISO code), optional tax rate in basis points, issue date, due date, optional related NDA.
- `money.ts` does all totals in integer minor units, and tax rounds once at the invoice level.
- `@react-pdf/renderer` templates, rendered server-side to a buffer. **The NDA template's legal wording is placeholder text marked `PLACEHOLDER — replace with reviewed wording`** in the PDF and in the code. You supply the real wording; I won't write legal language. The invoice template has no legal text and can be final.
- Every PDF footer: "Generated from a template. This is not legal or tax advice."

**Verify:** a script renders a sample NDA (both kinds) and invoice to `data/samples/` so you can open and check them by eye.

## Phase 4 — Chat

**Files:** `app/api/chat/route.ts`, `server/chat/model.ts`, `server/chat/system-prompt.ts`, `server/chat/tools.ts`, `app/(app)/page.tsx`, `app/(app)/chat/[chatId]/page.tsx`, chat atoms/molecules/organisms (message bubble, composer, message list, chat sidebar, confirm summary card), chat template.

- `server/chat/model.ts` creates the OpenRouter provider **once at module scope** and reads `OPENROUTER_MODEL` (default `nvidia/nemotron-3-super-120b-a12b:free`).
- `POST /api/chat`: `requireUser()` → load the chat, owned by that user → stream with `streamText` and tools → save the user and assistant messages on finish.
- The system prompt covers: NDAs and invoices only, decline and redirect anything else, never give legal or tax advice, ask only for missing fields (grouped), and never write document wording.
- The tools are user-scoped and Zod-validated, and invalid input returns an error to the model:
  - `setDocumentType`
  - `updateDraft` (validated against the partial schema)
  - `getBusinessProfile` / `saveBusinessProfile`
  - `findClients`
  - `findNdas` (for linking an invoice)
  - `requestConfirmation` returns the draft's missing fields, or a complete summary.
- **There is no generate tool.** When the draft is complete, the UI shows a summary card with a **Confirm** button.
- Sidebar of the user's chats, new chat, chat title taken from the first message.
- OpenRouter 429 or unavailable-model errors show a clear "the assistant is busy, try again shortly" message in the chat, not a crash.

**Verify:** NDA and invoice conversations end to end. Also check:
- an off-topic request gets redirected
- "is this enforceable?" gets the consult-a-professional reply
- a second account can't open the first account's chat URL (404)

## Phase 5 — Generate and download

**Files:** `server/documents/generate.ts`, `app/(app)/chat/[chatId]/actions.ts`, `app/api/documents/[id]/route.ts`, document card organism.

- The Confirm button calls the Server Action `generateDocument(chatId)`, which:
  1. calls `requireUser()`
  2. re-validates the full draft with the complete schema
  3. in one transaction: creates the client if it's new, assigns the invoice number, inserts the document
  4. renders the PDF and writes it to `data/documents/<id>.pdf`
- `GET /api/documents/[id]` checks ownership, then streams the stored PDF.
- The chat shows a document card with a download button. Asking for a change afterwards updates the draft, goes back through Confirm, and creates a new document. Old ones stay downloadable.

**Verify:** generate two invoices and confirm sequential numbers. Check that a re-download returns the identical file, and that another user's document ID returns 404.

## Phase 6 — Docker

**Files:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `next.config.ts` (`output: "standalone"`), `README.md`.

- Multi-stage build: pnpm installs **inside the image** (so `better-sqlite3` builds for Linux), and the runtime stage runs as a non-root user.
- Migrations run on container start, before the server starts.
- `docker-compose.yml` mounts a named volume at `/data`, holding the DB and generated PDFs, and passes env from `.env`.
- README: setup, env vars, backup note for the `/data` volume.

**Verify:** `docker compose up --build`, sign up, generate a document, `docker compose down && up`, confirm the user and document survive.

---

## Decisions (confirmed 2026-10-01)

- **Stored PDFs.** Generated PDFs are saved to `data/documents/<id>.pdf` and served as-is. AGENTS.md is updated to match.
- **Vitest** is the test framework, added in Phase 0. It covers `money.ts`, the Zod schemas, invoice numbering, and user scoping (tests added in the phases that create them). `pnpm test` joins the per-phase checks.
- **Design:** my pick, labeled as defaults in `docs/design-system.md` (see Phase 0b).
- **Repo:** `git init` and `.nvmrc` (Node 24) in Phase 0.

## Assumptions / risks

1. *(resolved: stored PDFs)*
2. **How It Works choices still unconfirmed:** the business profile is collected in chat on first use (no settings page), and each edit creates a new document. I'm building those as written unless you say otherwise.
3. *(resolved: Vitest)*
4. **Free-model tool calling may be unreliable.** Nemotron supports tools, but free models can mis-call them or drop out. Server-side validation catches bad calls. If it's too flaky in Phase 4, the fix is a different `OPENROUTER_MODEL`, not code.
5. **Shared free-tier limits:** about 50 requests/day across all users until you buy credits. One NDA conversation can take 5–10 requests. Fine for building; not for real users.
6. **No per-user chat rate limit.** Better Auth rate-limits auth routes, but nothing stops one user using up the shared OpenRouter quota. Adding one is a small follow-up if you want it.
7. **`@react-pdf/renderer` in Next.js server code** has had bundling issues before. If it breaks the build, I'll add it to `serverExternalPackages` and render in a Node runtime route.
8. **Node isn't on your default shell PATH,** only through nvm (v24.13.1 has pnpm). I'll use that, and I'll add a `.nvmrc` with `24` so the version is pinned.
9. **Data policy:** chat content, including client names and amounts, goes to whichever provider serves the free model. Check before real use.
10. **Design inputs for Phase 0b — I need these from you:**
    - **Logo:** do you have a logo or mark, or should it be a text-only "jara-legal" wordmark?
    - **Color:** a primary brand color or a color mood.
    - **Fonts:** a font preference or mood.
    - **Dark mode:** is it needed in v1?
    - **Visual style:** any radius or shadow taste, e.g. sharp and flat vs. soft and rounded.

    If you'd rather not decide, I'll pick sensible defaults and label them as assumptions in `docs/design-system.md`.
11. **PDF styling:** the PDFs use a restrained version of the tokens, meaning brand color and the font only if it can be embedded in `@react-pdf/renderer`. Print readability comes first.

## Verification (every phase)

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- the phase's own checks above, reported as passed / failed / not run
