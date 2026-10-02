# jara-legal

A chat-based NDA and invoice generator for freelance developers and small businesses. Sign in, say what you need, answer a few questions, and download a PDF.

Generated documents are templates filled with your input. They are not legal or tax advice.

## Requirements

- Node 24 (see `.nvmrc`; `nvm use`)
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env   # then fill in the values
pnpm dev
```

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Vitest unit tests |
| `pnpm db:generate` | Create a migration from schema changes (from Phase 1) |
| `pnpm db:migrate` | Apply pending migrations (from Phase 1) |

Project rules for contributors and coding agents are in [AGENTS.md](AGENTS.md). The build plan is [prompts/v1-build.md](prompts/v1-build.md).
