# PROGRESS.md — Development Status

> Last updated: 2026-03-19

---

## Current Phase: Phase 0 — Documentation & Setup

The project is in the **documentation and scaffolding** phase. No application code has been written yet.

---

## Phase Overview

| Phase | Name | Status |
|-------|------|--------|
| Phase 0 | Documentation & Setup | **In Progress** |
| Phase 1 | Core | Not Started |
| Phase 2 | Social | Not Started |
| Phase 3 | Expansion | Not Started |

---

## Phase 0 — Documentation & Setup

### Completed

- [x] Repository initialized
- [x] CLAUDE.md — AI assistant guide
- [x] CONVENTIONS.md — Strict coding rules
- [x] docs/OVERVIEW.md — Project overview
- [x] docs/PRD.md — Product requirements document
- [x] docs/ARCHITECTURE.md — System architecture
- [x] docs/DATABASE.md — Database design and reference
- [x] docs/DESIGN_GUIDE.md — Visual system and component specs
- [x] docs/PROMPTS.md — Vibe coding prompt templates
- [x] docs/PROGRESS.md — This file
- [x] README.md — Public-facing readme
- [x] specs/API.md — Full REST API documentation
- [x] specs/api-schema.json — OpenAPI 3.1 schema
- [x] architecture/architecture.json — Full system configuration
- [x] architecture/backend-dependencies.mmd — Server dependency graph
- [x] architecture/frontend-imports.mmd — Client import graph
- [x] architecture/org-chart.mmd — Monorepo folder hierarchy
- [x] architecture/schema-erd.md — Database ERD and data flows
- [x] Monorepo folder structure (`packages/client`, `server`, `shared`, `llm`)

### Remaining

- [ ] `package.json` (root) — pnpm workspace config
- [ ] `pnpm-workspace.yaml`
- [ ] `tsconfig.base.json`
- [ ] `.eslintrc.cjs`
- [ ] `.prettierrc`
- [ ] `.gitignore`
- [ ] `.env.example`
- [ ] Per-package `package.json` files
- [ ] Per-package `tsconfig.json` files
- [ ] Vite config (`packages/client`)
- [ ] Tailwind config (`packages/client`)
- [ ] DB migration files (`packages/server/src/db/migrations/`)

---

## Phase 1 — Core (Not Started)

| Feature | Status | Notes |
|---------|--------|-------|
| User registration/login | Not Started | Session-based auth (express-session) |
| Post creation (dual format) | Not Started | Natural language + CLI side by side |
| LLM transformation | Not Started | claude-sonnet first |
| Global feed | Not Started | Cursor-based pagination |
| Star | Not Started | Toggle via composite PK |
| Reply | Not Started | Threaded via parent_id |

### Key Deliverables
- `@clitoris/shared` — Type definitions (Post, User, ApiResponse)
- `@clitoris/llm` — Anthropic provider + transformer
- `@clitoris/server` — Express app, routes (posts, users, llm), DB setup
- `@clitoris/client` — Shell layout, global feed page, post card, composer

---

## Phase 2 — Social (Not Started)

| Feature | Status | Notes |
|---------|--------|-------|
| Follow/unfollow | Not Started | |
| Local feed | Not Started | Posts from followed users |
| Fork | Not Started | Clone post to own timeline |
| User profile page | Not Started | `/@:username` route |

---

## Phase 3 — Expansion (Not Started)

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-LLM support | Not Started | GPT-4o, Llama-3 providers |
| Multilingual auto-translation | Not Started | `--translate=auto` |
| Explore/trending | Not Started | Algorithm TBD |
| Custom LLM connections | Not Started | User-provided API keys |

---

## Document Index

| File | Purpose | Status |
|------|---------|--------|
| `README.md` | Public-facing project readme | Done |
| `CLAUDE.md` | AI assistant project guide | Done |
| `CONVENTIONS.md` | Strict coding rules & prohibitions | Done |
| `docs/OVERVIEW.md` | Project overview & core concepts | Done |
| `docs/PRD.md` | Full product requirements | Done |
| `docs/ARCHITECTURE.md` | System architecture & data flows | Done |
| `docs/DATABASE.md` | DB schema, queries, migrations | Done |
| `docs/DESIGN_GUIDE.md` | Visual system & component specs | Done |
| `docs/PROMPTS.md` | Vibe coding prompt templates | Done |
| `docs/PROGRESS.md` | Development status (this file) | Done |
| `specs/API.md` | Full REST API documentation | Done |
| `specs/api-schema.json` | OpenAPI 3.1 machine-readable schema | Done |
| `architecture/architecture.json` | Full system configuration (JSON) | Done |
| `architecture/backend-dependencies.mmd` | Server module dependency graph | Done |
| `architecture/frontend-imports.mmd` | Client component import graph | Done |
| `architecture/org-chart.mmd` | Monorepo folder hierarchy | Done |
| `architecture/schema-erd.md` | Database ERD + data flow examples | Done |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-19 | Use SQLite over PostgreSQL | Zero config, single file, sufficient for MVP |
| 2026-03-19 | No ORM, raw SQL only | AI generates cleaner raw SQL; less abstraction |
| 2026-03-19 | pnpm monorepo | Clear package boundaries help AI navigate code |
| 2026-03-19 | Tailwind only, no custom CSS | AI generates Tailwind reliably; consistent output |
| 2026-03-19 | Zustand over Redux | Less boilerplate; AI produces cleaner stores |
| 2026-03-19 | No light mode | Terminal aesthetic demands dark-only |
| 2026-03-19 | Unicode icons only | No icon library dependencies; terminal feel |
| 2026-03-19 | Vibe coding approach | AI-driven development with strict conventions |
