# GLOSSARY.md — Unified Terminology Index

> **Source of truth** for all domain-specific terms used across CLItoris documentation.
> AI agents should reference this file when encountering unfamiliar terms.

---

| Term | Definition |
|------|-----------|
| **Analyze** | AI-powered GitHub repo analysis producing reports, PPTX, or video (`/analyze` route) |
| **GitHub Feed** | Integrated view of the user's GitHub Stars, Notifications, and Issues/PRs (`/github` route) |
| **GitHub sync** | Two operations: `sync-profile` (re-fetches avatar/bio) and `sync-activity` (imports events as posts) |
| **github_synced_events** | Dedup table preventing the same GitHub event from being imported multiple times as posts |
| **g-chord shortcut** | Two-key keyboard shortcut starting with `g` (e.g., `gh` = go home, `gs` = go settings). 600ms timeout |
| **Seed** | Mock data script (`scripts/seed.ts`) that populates the DB with users, posts, stars, and follows for design preview |
| **By LLM filter** | Browse posts filtered by which LLM model was used for transformation |
| **CLI command** | A structured text representation of a post using flags (e.g., `post --user=name --message="text"`) |
| **Composer** | The input area where users write natural language text to create a post |
| **Credential auto-detection** | Server scans local env vars and config files (e.g., `gcloud auth`) to auto-detect available LLM providers without manual API key entry |
| **Cursor pagination** | Pagination using the last item's timestamp instead of page numbers. Never use OFFSET-based pagination |
| **Custom LLM** | User-provided LLM connection (via API key) beyond the built-in Claude/GPT/Gemini/Llama |
| **Debounce** | Delay execution until user stops typing/clicking for N milliseconds. Used in search and form inputs |
| **Dual-format** | Every post exists in two forms simultaneously: natural language and CLI command |
| **Dual panel** | The side-by-side display of natural language (left) and CLI command (right) |
| **Feed** | A chronological list of posts (global = all public, local = followed users only) |
| **Fork** | Clone another user's post to your own timeline with attribution to the original |
| **isSubmitting guard** | Boolean flag in Zustand stores that prevents duplicate API calls from rapid clicks. See `PATTERNS.md` Race Condition Prevention |
| **LLM transform** | The process of converting natural language into CLI command format using an AI model |
| **Optimistic update** | UI updates immediately before server confirmation; reverts on failure. See `PATTERNS.md` section 1 |
| **Provider** | LLM service adapter implementing the common `LlmProvider` interface (e.g., Anthropic, OpenAI, Ollama) |
| **Reply** | Respond to a post, creating a threaded conversation |
| **Setup** | First-time profile configuration after GitHub OAuth. Replaces the old registration flow (`/setup` route) |
| **Star** | Bookmark/like a post (toggle action) |
| **Store** | Zustand state container (e.g., `feedStore.ts`, `authStore.ts`). Located at `packages/client/src/stores/` |
| **Terminal aesthetic** | Dark backgrounds, monospace fonts, green/amber/cyan text — mimicking a CLI terminal |
| **UUID v7** | Time-sortable universally unique identifier used as primary key for all database tables |
| **Visibility** | Post access level: `public` (everyone), `private` (author only), `unlisted` (direct link only) |
| **WAL mode** | SQLite Write-Ahead Logging (`PRAGMA journal_mode = WAL`) for concurrent read access |

---

## See Also

- [PRD.md](./specs/PRD.md) — Full product requirements and MVP scope
- [PATTERNS.md](./guides/PATTERNS.md) — Implementation patterns referenced above
- [LLM_INTEGRATION.md](./llm/LLM_INTEGRATION.md) — LLM provider interface details
