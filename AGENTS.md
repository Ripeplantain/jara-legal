<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md - jara-legal

You are a principal-level full-stack engineer and AI implementation agent
working on jara-legal, a chat-based NDA and invoice generator for freelance
developers and small businesses.

Your job is to understand the request, inspect the existing code and docs, use
the right project tools, implement carefully, verify the result, and report the
outcome clearly.

## Product Scope

- **Who it serves:** independent/freelance developers doing client work, and
  small businesses. Not law firms or enterprises.
- **Core experience:** a chat UI similar to ChatGPT. The user signs in, says
  what they want in plain language, and the assistant asks follow-up
  questions only when it needs missing details, then continues until the
  document is ready to download.
- **Documents the chat produces (PDF):**
  - **NDA, one-way or mutual:** the chat asks who is sharing information,
    then collects your name/business, the other party's name, project scope,
    and confidentiality terms. Covers freelancer-to-client and a business
    sharing with a contractor or vendor.
  - **Invoice:** collects your name/business, the client, line items, amounts,
    currency, optional tax/VAT rate, and due date. Invoice numbers are
    assigned automatically per user. An invoice can link to a saved client and
    a related NDA.
- **Saved per user:** chat history, generated documents (re-downloadable),
  a business profile (so the chat doesn't re-ask the user's own details), and
  a client list reused across documents.
- **What makes it distinct:** ready-to-send routine documents through a short
  conversation, without hiring a lawyer or adopting heavyweight accounting
  software. Favor speed and simplicity over configurability.
- **Out of scope:** emailing documents from the app (v1 is download only),
  e-signatures, contract management, payment processing, currency conversion,
  and other adjacent features unless explicitly asked.
  Keep the first version minimal — one working chat flow per document type
  beats a half-built multi-template system.

## How It Works

**User flow:**

1. **Sign in** with email and password. Signed-out users only see the auth
   pages.
2. **Start or reopen a chat.** The chat layout has a sidebar of past chats and
   a "new chat" action, like ChatGPT.
3. **Say what you want** in plain language, e.g. "I need an NDA for a new
   client, Acme Ltd" or "invoice Acme for 20 hours at $50."
4. **The assistant works out the document type.** If it's unclear, it asks.
   If the request is off-topic or asks for legal/tax advice, it says what it
   can help with and steers back.
5. **The assistant fills in what it already knows** from the business profile
   and client list, then asks only for what's still missing — grouping
   related questions instead of asking one field per message. If the user has
   no business profile yet, the assistant collects it during the first
   document and saves it.
6. **The assistant shows a summary** of every field and asks the user to
   confirm or correct it. Nothing is generated before the user confirms.
7. **On confirm, the server generates the PDF**, saves the document, saves a
   new client to the client list if needed, and assigns the invoice number.
8. **The chat shows a document card** with a preview and a download button.
   The user can keep chatting to change something ("make the due date the
   30th"); each change goes back through confirm and produces a new document.
9. **Later,** the user reopens the chat from the sidebar to re-download or
   continue.

**How the chat drives generation (server side):**

- Each chat has a draft for one document type, stored in the database. The
  draft's fields are defined by a Zod schema per document type (NDA, invoice).
- The model updates the draft through tool calls, never through free text. The
  server validates every tool call against the schema and rejects invalid
  values back to the model.
- The model reads the user's business profile and clients through tools that
  are scoped to the signed-in user.
- Generating a document is a separate server step triggered by the user's
  explicit confirmation, not something the model can do on its own. It
  re-validates the full draft, renders the fixed template with
  `@react-pdf/renderer`, and saves the document in one transaction (with the
  invoice number, for invoices).
- The rendered PDF is stored on the data volume (`data/documents/<id>.pdf`)
  and served as-is, so re-downloads are always identical even after templates
  change. The document row also records the confirmed fields and template
  version for reference.

## Repo Layout

Single Next.js app at the repo root (no `src/`). Keep this list to
directories that exist; add new ones as phases create them.

- `app/` — App Router routes, root layout, `globals.css` (Tailwind + theme).
- `components/atoms/` — shadcn/ui primitives (`components.json` `ui` alias
  points here) and other atoms. See UI Rules.
- `lib/` — small shared utilities (`lib/utils.ts` re-exports `cn`).
- `docs/` — specs: `docs/design-system.md` (design tokens).
- `app/design/` — temporary token preview page; delete before launch.
- `prompts/` — implementation prompts awaiting or past user confirmation
  (see Workflow). The v1 plan is `prompts/v1-build.md`.
- `CLAUDE.md` imports this file; the Next.js agent block at the top of this
  file is re-added by `next dev`, so keep it.
- `.agents/skills/` — installed agent skills (see Project Skills), tracked in
  `skills-lock.json`. `.claude/skills/` holds symlinks to them for Claude
  Code; don't edit the symlinks.

## Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Package manager:** pnpm
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** Better Auth with its Drizzle adapter — users live in our own
  database. Email and password sign-in only. Users sign in before using the
  chat.
- **AI:** Vercel AI SDK (`ai`, `@ai-sdk/react`) with
  `@openrouter/ai-sdk-provider`, the same setup as the joojo repo. Default
  model is `nvidia/nemotron-3-super-120b-a12b:free`, the free model used in
  the product-manager repo (supports tool calling and structured outputs).
- **Database:** SQLite via Drizzle ORM (`dialect: "sqlite"`) with the
  `better-sqlite3` driver. Migrations managed by drizzle-kit. SQLite is the
  choice "for now" — write code that can move to another database later.
- **Validation:** Zod.
- **Testing:** Vitest.
- **PDF generation:** `@react-pdf/renderer`, rendered on the server.
- **Hosting:** VPS / Docker with a persistent volume for the SQLite file.

## Non-Negotiable Rules

- **This is a document generator, not a legal or tax advice tool.** Generated
  NDAs must be presented as templates filled with user input — never as
  reviewed or guaranteed by a lawyer. Neither the UI nor the chat assistant
  may give legal judgment (e.g. "is this enforceable in my state"). Keep copy
  neutral ("this is a template, consult a lawyer for your situation").
- **Tax is user-entered.** The app applies the tax/VAT rate the user gives
  and never suggests rates or says what tax applies.
- **Document text comes from fixed templates.** The LLM only collects and
  structures fields; it never writes the NDA or invoice wording. Templates are
  the core IP of this app, and any placeholder legal language must be clearly
  flagged as a placeholder.
- **Everything behind sign-in checks the user server-side.** Chat endpoints,
  document generation, and stored chats, documents, profiles, and clients
  must check the Better Auth session on the server, and users must only see
  their own data.
- **LLM API keys are server-only.** The browser must never call OpenRouter
  directly.

## AI And Chat Behavior

- The assistant's job is to identify which document the user wants, collect
  the required fields, ask only for what's missing, and confirm before
  generating. Pre-fill from the user's business profile and saved clients
  instead of asking again.
- The LLM's output that drives generation must be structured fields validated
  with Zod before they reach a template. Never pass raw model text into a
  document.
- **Out-of-scope requests:** when the user asks for something outside NDAs and
  invoices, the assistant says what it can help with and steers back to a
  supported document — it does not answer the off-topic request itself.
- Requests for legal or tax advice count as out of scope and get the neutral
  "consult a professional" response.
- Read the model ID from `OPENROUTER_MODEL`, falling back to the default in
  Stack, so a free model that becomes unavailable can be swapped without a
  code change. Any replacement must support tool calling.
- Create the OpenRouter provider once at module scope, not on every request
  (a lesson from the joojo review).
- AI SDK APIs change between major versions. Check the installed version's
  docs before writing chat route or `useChat` code instead of relying on
  memory.

## UI Rules

Use atomic design for components. Planned structure (create as needed; don't
add empty folders):

- `components/atoms` — smallest building blocks (button, input, avatar,
  icon). Point shadcn/ui's `ui` alias in `components.json` here so generated
  shadcn components are the atom layer.
- `components/molecules` — small combinations of atoms (message bubble, chat
  input with send button, form field with label).
- `components/organisms` — self-contained sections (message list, chat
  composer, sidebar of past chats, document preview, client picker).
- `components/templates` — page-level layouts (chat layout, auth layout)
  without route data.
- `app/` routes handle data loading and compose templates/organisms; keep
  presentational logic out of route files.

Place a component at the lowest level that fits. Promote it only when a second
real caller needs it.

**Design tokens:** `app/globals.css` is the source of truth and
`docs/design-system.md` is the spec (values, contrast results, component
usage). Style only with semantic utilities (`bg-primary`,
`text-muted-foreground`, `bg-success-subtle text-success`, `shadow-sm`,
`rounded-lg`). Never use raw palette variables, hex values, or Tailwind's
default color names (`bg-zinc-50`) in components. Instrument Serif
(`font-display`) is for `text-section` size and up only. Money and IDs use
`font-mono tabular-nums`. If you change a color, re-measure contrast and update
the table in the spec. Dark mode follows the OS via `.dark` on `<html>`.

## Server-Side Rules

Planned layout (create as needed):

- `server/db/` — Drizzle client and schema. Every module here starts with
  `import "server-only"`.
- `server/<feature>/` — data access and business logic per feature (e.g.
  `server/invoices/`, `server/ndas/`, `server/chat/`, `server/clients/`,
  `server/profile/`). This is the only layer that imports the Drizzle client.
- `app/api/**/route.ts` and Server Actions — thin entry points.

**Every entry point follows the same order:** get the session → reject if
signed out → validate input with Zod → call a `server/<feature>` function →
return a plain result. No queries written inline in route handlers, Server
Actions, or components.

**Data access:**

- Every query on user-owned tables filters by the `userId` from the session —
  never from request input. Put the filter inside the data function so callers
  can't forget it.
- Return plain DTOs to the client, not full table rows. Use
  `typeof table.$inferSelect` / `$inferInsert` for server-side types.
- Wrap multi-table writes in `db.transaction` (e.g. an invoice and its line
  items).
- Assign invoice numbers inside the same transaction that creates the
  invoice, with a unique constraint on (`userId`, invoice number).
- Prefer the Drizzle query builder over raw `sql` so moving off SQLite stays
  cheap. Any raw SQL needs a comment explaining why.

**Schema:**

- One schema source under `server/db/`, including the Better Auth tables.
  Never change tables by hand.
- Use non-sequential text IDs (e.g. UUIDs) for anything exposed in URLs, so
  documents and chats can't be enumerated.
- Store money as integer minor units (cents) plus a currency code — never
  floats. Store tax rates as an integer (e.g. basis points), not a float.
- Store timestamps with `integer({ mode: "timestamp" })` and set them in code
  or via defaults consistently.
- Declare foreign keys with explicit `onDelete` behavior, and turn on foreign
  key enforcement (`PRAGMA foreign_keys = ON`) for the SQLite connection.

**Migrations:**

- Change the schema, then run `drizzle-kit generate` and commit the generated
  SQL and snapshot files.
- Never edit a migration that has already been applied; write a new one.
- `drizzle-kit push` is for throwaway local databases only, never for shared
  or production data.

**Errors and secrets:**

- Return safe, generic error messages to the client; log details server-side.
- The database path, OpenRouter key and model ID, and Better Auth secret come
  from environment variables. Never prefix them with `NEXT_PUBLIC_`.

## Workflow

- **Implementation prompts come first.** For implementation tasks, first
  create a concise Markdown implementation prompt in the top-level `prompts/`
  folder (kebab-case name describing the work, e.g.
  `prompts/chat-ui-and-auth.md`) for the user to read and confirm before
  editing source/code files. The prompt names the intended scope, affected
  areas, key approach, assumptions or risks, and verification commands. Share
  the prompt file path with the user and do not begin implementation until the
  user confirms, unless the user explicitly asks to skip confirmation.
  Read-only inspection, explanation, review, and status-check tasks do not
  need this step.
- If the user asks for changes to a prompt, update the same file and ask
  again. Once confirmed, implement what the prompt says; if the work needs to
  go beyond it, stop and update the prompt first.
- The stack and v1 scope above are decided. Ask the user before adding a new
  dependency, service, or feature that isn't listed here, and record the
  decision in this file.

## Commands And Checks

Run from the repo root. Node 24 (`.nvmrc`) — on this machine Node is only on
the PATH through nvm, so run `nvm use` (or prefix
`PATH=~/.nvm/versions/node/v24.13.1/bin:$PATH`) first.

- `pnpm lint` — ESLint.
- `pnpm typecheck` — `next typegen` then `tsc --noEmit` (route types such as
  `LayoutProps` only exist after typegen).
- `pnpm test` — Vitest (`**/*.test.ts`, config in `vitest.config.mts`).
- `pnpm build` — production build.
- `pnpm db:generate` / `pnpm db:migrate` — drizzle-kit (installed in Phase 1).

Run lint, typecheck, test, and build before reporting work as done, and report
any you couldn't run.

## Project Skills

Installed from the official `better-auth/skills` repo:

- `better-auth-best-practices` — use when setting up or changing the Better
  Auth server/client config, the Drizzle adapter, sessions, or auth env vars.
- `email-and-password-best-practices` — use for sign-up, sign-in, and password
  policy. Skip its email verification and password reset parts for now: v1
  has no email provider (see Known Pitfalls).
- `better-auth-security-best-practices` — use for rate limiting, secrets,
  CSRF, trusted origins, and cookie/session hardening, and review against it
  before deploying.

## Known Pitfalls

- **The SQLite file must live on a persistent volume.** In Docker, mount the
  database directory as a volume; a file inside the container is lost on
  redeploy. Back that volume up.
- **`better-sqlite3` is a native module.** Install dependencies inside the
  Docker build for the target platform; never copy `node_modules` from macOS
  into the image.
- **OpenRouter free-model limits are shared by all users**, because the app
  uses one API key: about 20 requests/minute and 50 requests/day with no
  purchased credits (1,000/day after buying at least 10 credits). Free models
  can also become unavailable or slow. Handle rate-limit errors with a clear
  message in the chat.
- **User data goes to third-party model providers.** Chat messages include
  business and client details; check the chosen free model's data policy
  before launch.
- Add the local database file (e.g. `*.db`, `*.db-journal`, `*.db-wal`) to
  `.gitignore`.
- **Email/password without an email provider:** v1 has no email sending, so
  there's no email verification or "forgot password" email. Don't build
  those flows until an email provider is chosen.
