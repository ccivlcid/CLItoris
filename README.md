# CLItoris

**The social network that speaks your language — and CLI.**

> Write what you want to say. An AI translates it into a CLI command. Both get posted side by side.

[한국어](./README_ko.md)

<!-- TODO: Add screenshot here -->

---

## How It Works

1. **Connect** with your GitHub account (one-click OAuth)
2. **Write** anything in natural language
3. **Pick** an AI model (Claude, GPT-4o, Llama 3, or your own)
4. **Press** Cmd+Enter
5. **AI transforms** your text into a structured CLI command
6. **Both versions** get posted side by side — human-readable and machine-parseable

That's it. Every post lives in two worlds.

---

## Features

### GitHub-Native Identity
Login exclusively via GitHub OAuth. No passwords, no sign-up forms — just `$ ssh terminal.social` and connect. Your developer identity is your social identity.

### Dual-Format Posts
Every post shows your original text alongside its CLI representation. Think of it as subtitles for code.

```
┌─ Natural Language ─────────┐  ┌─ CLI — claude-sonnet ──────┐
│ While vibe-coding, I       │  │ post --user=jiyeon.kim \   │
│ realized we might be       │  │   --lang=ko \              │
│ adapting to AI, not the    │  │   --message="observing AI  │
│ other way around.          │  │   language convergence" \  │
│ #vibe-coding #thoughts     │  │   --tags=vibe-coding       │
└────────────────────────────┘  └────────────────────────────┘
```

### Fork, Don't Repost
See something interesting? **Fork it** — like forking a repo. Your version links back to the original, and you can remix the content.

### Choose Your AI
Pick which AI model translates your posts:
- **Claude** (Anthropic) — default
- **GPT-4o** (OpenAI)
- **Gemini** (Google)
- **Llama 3** (local via Ollama — no API key, full privacy)
- **Custom** — bring your own model via generic API

### Repo Attachments
Tag GitHub repos in your posts with `--repo=owner/name`. Discuss code, share projects, and discover repos through the feed.

### Repo Analysis
Analyze any GitHub repo with AI. Get architecture reports, auto-generated presentations, or video walkthroughs.

```bash
$ analyze --repo=vercel/next.js --output=report     # Architecture analysis
$ analyze --repo=owner/name --output=pptx --slides=10  # Slide deck
$ analyze --repo=owner/name --output=video --duration=60s  # Video walkthrough
```

### Local LLM
Run models locally via Ollama — no API key, no cloud, full privacy for sensitive repos. CLItoris detects your hardware and recommends the best model.

### Browse by AI
Curious how different AIs interpret the same ideas? Filter the feed by model and compare.

### Terminal Aesthetic
Dark backgrounds. Monospace fonts. Green text on black. No gradients, no rounded corners, no fluff. Just content.

### Multilingual
Write in any language. The AI handles the translation to CLI format. Every post shows its language tag (`--lang=ko`, `--lang=en`, `--lang=hi`).

### Keyboard-First
Navigate with `j`/`k`, star with `s`, reply with `r`, fork with `f`, compose with `/`. Terminal users feel at home.

---

## Tech Stack

| Area | Technology |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| State | Zustand |
| Backend | Node.js + Express + tsx |
| Database | SQLite (better-sqlite3) |
| Auth | GitHub OAuth 2.0 (PKCE) |
| LLM | Anthropic, OpenAI, Google Gemini, Ollama, CLI adapters, Generic API |
| Testing | Vitest + Playwright |
| Package Manager | pnpm workspaces (monorepo) |

---

## Quick Start

```bash
git clone https://github.com/ccivlcid/CLItoris.git
cd CLItoris
cp .env.example .env            # Add GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SESSION_SECRET
pnpm install                    # Install dependencies
pnpm dev                        # Start dev servers
```

Open `http://localhost:5173` and connect with GitHub.

---

## Project Structure

```
packages/
├── client/    # React frontend (Vite + Tailwind)
├── server/    # Express API server (tsx)
├── shared/    # Shared types, constants
└── llm/       # LLM provider integration
docs/          # All documentation (guides, specs, screens, architecture)
```

---

## Contributing

This project is built with **vibe coding** — AI-driven development with strict conventions.

Before contributing, read:
1. [CLAUDE.md](./CLAUDE.md) — Project guide for AI assistants
2. [Conventions](./docs/guides/CONVENTIONS.md) — Strict coding rules
3. [Design Guide](./docs/design/DESIGN_GUIDE.md) — Visual system

Full documentation lives in [`docs/`](./docs/) organized by category:
- `docs/guides/` — Coding conventions, design system, testing, prompts
- `docs/screens/` — Page-by-page UI specifications (8 screens)
- `docs/specs/` — PRD, database schema, API documentation
- `docs/architecture/` — System diagrams and Mermaid flowcharts

---

## Roadmap

| Phase | Focus | Key Features |
|-------|-------|-------------|
| **Phase 1** | Core | GitHub OAuth, dual-format posts, LLM transform, global feed |
| **Phase 2** | Social | Follow/following, local feed, fork, user profiles with GitHub info |
| **Phase 3** | Expansion | Multi-LLM, local LLM setup, translation, explore/trending |
| **Phase 4** | GitHub Deep | Repo attachments, trending repos, activity import, repo analysis (report) |
| **Phase 5** | Analysis | PPTX generation, video generation, `/analyze` page, analysis feed |

See [PROGRESS.md](./docs/PROGRESS.md) for the full roadmap.

---

## See Also

- [CLAUDE.md](./CLAUDE.md) — Tech stack, monorepo structure, documentation map
- [docs/](./docs/) — Complete documentation (guides, specs, architecture, screens)

---

## License

TBD
