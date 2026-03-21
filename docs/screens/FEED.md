# FEED Screen Specification

> **Source of truth** for the unified Feed screen (`/feed`).
> Created: 2026-03-21 — Merges GLOBAL_FEED.md and LOCAL_FEED.md as part of B-plan.

---

## 1. Screen Overview

| Property      | Value                                                        |
|---------------|--------------------------------------------------------------|
| **Route**     | `/feed`                                                      |
| **Title**     | `terminal.social / feed`                                     |
| **Description** | **Social layer.** Unified feed with Global and Local tabs. Shows shared analysis results and posts in reverse chronological order. Analysis result cards (with repo info, summary, stats) appear alongside regular dual-format post cards. |
| **Auth Required** | No (Global tab viewing). Yes (Local tab, composing, starring, replying, forking). |
| **Priority**  | Secondary to Analyze — this is the social distribution layer. |

---

## 2. Tabs

```
$ feed --tab=[global | local]
               ──────  ─────
```

| Tab | Description | Auth |
|-----|-------------|------|
| **Global** (default) | All public posts and shared analyses | No |
| **Local** | Posts and analyses from followed users only | Yes |

---

## 3. Card Types in Feed

### Analysis Result Card
When a user shares an analysis result, it appears as a special card:

```
@dev1 · 2h ago                                             --analysis
┌──────────────────────────────────────────────────────────────────┐
│ ▶ vercel/next.js                    report · claude-sonnet      │
│                                                                  │
│ "Production-grade React framework with hybrid rendering..."     │
│                                                                  │
│ TypeScript 87% · React · Turbopack                              │
│                                                                  │
│ ★ 42  ↗ view analysis  · 12.3s                                 │
└──────────────────────────────────────────────────────────────────┘
  ↵ reply 3   ○ fork 1   ★ star 42
```

Clicking "view analysis" navigates to `/analysis/:id`.

### Regular Post Card (Dual Format)
Standard dual-panel post (natural language | CLI). Same as existing PostCard.

---

## 4. Changes from Legacy

| Before (A-plan) | After (B-plan) |
|-----------------|----------------|
| `/` = Global feed | `/` = Home (Hero + Analyze CTA) |
| `/feed/local` = Local feed | `/feed?tab=local` = Local tab |
| Feed is primary entry | Feed is social layer, secondary to Analyze |
| Only post cards | Analysis result cards + post cards |
| Post creation as center nav action | Post creation via FAB or header button |

---

## 5. Entry Points

Users reach the Feed from:
- Home page "$ feed --more" link
- Sidebar navigation (second item after Analyze)
- Mobile bottom nav (first item)
- After sharing an analysis result ("View in feed")

---

## See Also

- [HOME.md](./HOME.md) — New home page (primary entry)
- [ANALYZE.md](./ANALYZE.md) — Analyze page (primary feature)
- [GLOBAL_FEED.md](./GLOBAL_FEED.md) — Legacy global feed spec (retained for reference)
- [LOCAL_FEED.md](./LOCAL_FEED.md) — Legacy local feed spec (retained for reference)
- [DESIGN_COMPONENTS.md](../design/DESIGN_COMPONENTS.md) — Analysis Result Card component spec
