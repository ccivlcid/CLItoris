# HOME Screen Specification

> **Source of truth** for the Home screen (`/`).
> **B-plan**: This replaces the previous GlobalFeedPage as the landing page.

---

## 1. Screen Overview

| Property        | Value                                                        |
|-----------------|--------------------------------------------------------------|
| **Route**       | `/`                                                          |
| **Title**       | `terminal.social — Repo Analysis Platform`                   |
| **Description** | Landing page. Hero section with value proposition and repo URL input. Below: popular analyses, recent shared results, and platform stats. First-time visitors understand the product within 5 seconds. |
| **Auth Required** | No. Unauthenticated users see the full page; CTA leads to `/login` then `/analyze`. |
| **Priority**    | **P0** — First impression of the platform. |

---

## 2. UX Goals

Within 5 seconds, a visitor must understand:
1. **What** this service does (analyze GitHub repos with AI)
2. **How** to use it (enter a repo URL)
3. **What** they get (structured insights: report, slides, video)

---

## 3. Desktop Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ terminal.social                                          [Login] or @user ▾     │
├────────────────┬────────────────────────────────────────────────────────────────┤
│                │                                                                │
│ // navigate    │  ┌─ Hero ────────────────────────────────────────────────┐    │
│ $ analyze      │  │                                                       │    │
│   feed         │  │  $ analyze --repo=                                    │    │
│   explore      │  │                                                       │    │
│   search       │  │  AI-powered GitHub repo analysis.                     │    │
│   ...          │  │  Get structured insights in seconds.                  │    │
│                │  │                                                       │    │
│                │  │  ┌──────────────────────────────────────────────┐     │    │
│                │  │  │ owner/repo                            [⏎]   │     │    │
│                │  │  └──────────────────────────────────────────────┘     │    │
│                │  │                                                       │    │
│                │  │  output: [report]  [pptx]  [video]                   │    │
│                │  │                                                       │    │
│                │  │  ┌──────────────────────────────────────────────┐     │    │
│                │  │  │ $ analyze                                    │     │    │
│                │  │  └──────────────────────────────────────────────┘     │    │
│                │  │                                                       │    │
│                │  └───────────────────────────────────────────────────────┘    │
│                │                                                                │
│                │  ┌─ Popular Analyses ─────────────────────────────────────┐   │
│                │  │ // trending this week                                  │   │
│                │  │                                                         │   │
│                │  │ ■ vercel/next.js        128k★  report  claude-sonnet   │   │
│                │  │   "Production-grade React framework with hybrid..."    │   │
│                │  │                                                         │   │
│                │  │ ■ facebook/react         230k★  report  gpt-4o         │   │
│                │  │   "Declarative UI library with fiber reconciler..."    │   │
│                │  │                                                         │   │
│                │  │ ■ denoland/deno          98k★   pptx    gemini         │   │
│                │  │   "Secure JavaScript/TypeScript runtime..."            │   │
│                │  │                                                         │   │
│                │  │ $ explore --more                                        │   │
│                │  └─────────────────────────────────────────────────────────┘   │
│                │                                                                │
│                │  ┌─ How It Works ─────────────────────────────────────────┐   │
│                │  │                                                         │   │
│                │  │  1. Enter a GitHub repo   →  vercel/next.js            │   │
│                │  │  2. AI analyzes the code  →  ░░░░░░░░░░ analyzing...   │   │
│                │  │  3. Get structured report →  Summary, Stack, Arch...   │   │
│                │  │  4. Share or download     →  $ post --attach=report    │   │
│                │  │                                                         │   │
│                │  └─────────────────────────────────────────────────────────┘   │
│                │                                                                │
│                │  ┌─ Recent Shared ────────────────────────────────────────┐   │
│                │  │ // latest from the community                           │   │
│                │  │                                                         │   │
│                │  │ @dev1 analyzed tailwindlabs/tailwindcss · 2h ago       │   │
│                │  │ @dev2 analyzed prisma/prisma · 5h ago                  │   │
│                │  │ @dev3 analyzed langchain-ai/langchain · 1d ago         │   │
│                │  │                                                         │   │
│                │  │ $ feed --more                                           │   │
│                │  └─────────────────────────────────────────────────────────┘   │
│                │                                                                │
└────────────────┴────────────────────────────────────────────────────────────────┘
```

---

## 4. Mobile Wireframe

```
┌─────────────────────────────────┐
│ terminal.social          [Login]│
├─────────────────────────────────┤
│                                  │
│ ┌─ Hero ─────────────────────┐  │
│ │                              │  │
│ │  $ analyze --repo=           │  │
│ │                              │  │
│ │  AI-powered GitHub repo      │  │
│ │  analysis. Get insights      │  │
│ │  in seconds.                 │  │
│ │                              │  │
│ │  ┌────────────────────────┐  │  │
│ │  │ owner/repo        [⏎] │  │  │
│ │  └────────────────────────┘  │  │
│ │                              │  │
│ │  [report] [pptx] [video]    │  │
│ │                              │  │
│ │  ┌────────────────────────┐  │  │
│ │  │ $ analyze              │  │  │
│ │  └────────────────────────┘  │  │
│ │                              │  │
│ └──────────────────────────────┘  │
│                                  │
│ ┌─ Popular ──────────────────┐  │
│ │ ■ vercel/next.js           │  │
│ │   report · claude · 128k★  │  │
│ │                              │  │
│ │ ■ facebook/react            │  │
│ │   report · gpt-4o · 230k★  │  │
│ │                              │  │
│ │ $ explore --more            │  │
│ └──────────────────────────────┘  │
│                                  │
│ ┌─ How It Works ─────────────┐  │
│ │ 1. Enter repo              │  │
│ │ 2. AI analyzes             │  │
│ │ 3. Get report              │  │
│ │ 4. Share / download        │  │
│ └──────────────────────────────┘  │
│                                  │
│ ┌─ Recent ───────────────────┐  │
│ │ @dev1 · tailwindcss · 2h   │  │
│ │ @dev2 · prisma · 5h        │  │
│ │ $ feed --more              │  │
│ └──────────────────────────────┘  │
│                                  │
├─────────────────────────────────┤
│  ~    ◆    [▶]    ●    @       │
│ feed expl analyze actv profile │
└─────────────────────────────────┘
```

---

## 5. Component Tree

```
HomePage                               src/pages/HomePage.tsx
├── AppShell                           src/components/layout/AppShell.tsx
│   ├── HeaderBar                      src/components/layout/HeaderBar.tsx
│   ├── Sidebar                        src/components/layout/Sidebar.tsx
│   └── MainContent                    (slot)
│       ├── HeroSection                src/components/home/HeroSection.tsx
│       │   ├── Tagline                // "AI-powered GitHub repo analysis"
│       │   ├── RepoInput             src/components/analyze/RepoInput.tsx (reused)
│       │   ├── OutputTypeQuickSelect  // [report] [pptx] [video]
│       │   └── AnalyzeCTA            // "$ analyze" button → /analyze or /login
│       ├── PopularAnalyses            src/components/home/PopularAnalyses.tsx
│       │   └── AnalysisPreviewCard[]  src/components/home/AnalysisPreviewCard.tsx
│       ├── HowItWorks                 src/components/home/HowItWorks.tsx
│       │   └── Step[]                 // 4 steps with terminal aesthetic
│       └── RecentShared               src/components/home/RecentShared.tsx
│           └── SharedAnalysisItem[]   src/components/home/SharedAnalysisItem.tsx
├── MobileNav                          src/components/layout/MobileNav.tsx
│   └── center button = Analyze
```

---

## 6. State Requirements

### Zustand Stores

**`homeStore`** — `src/stores/homeStore.ts`

```typescript
interface HomeState {
  // Hero form (lightweight — full form is on /analyze)
  repoInput: string;
  outputType: 'report' | 'pptx' | 'video';

  // Popular analyses
  popularAnalyses: AnalysisPreview[];
  isLoadingPopular: boolean;

  // Recent shared
  recentShared: SharedAnalysis[];
  isLoadingRecent: boolean;

  // Actions
  setRepoInput: (value: string) => void;
  setOutputType: (type: 'report' | 'pptx' | 'video') => void;
  goToAnalyze: () => void;  // navigate to /analyze with pre-filled repo
  fetchPopular: () => Promise<void>;
  fetchRecent: () => Promise<void>;
}
```

---

## 7. API Calls

### On Mount

| Trigger       | Endpoint                              | Method | Auth | Purpose                           |
|---------------|---------------------------------------|--------|------|-----------------------------------|
| Page load     | `/api/analyze/popular`                | GET    | No   | Fetch trending/popular analyses   |
| Page load     | `/api/posts/feed/global?limit=5`      | GET    | No   | Fetch recent shared analysis posts |

### On User Interaction

| Trigger               | Endpoint | Method | Auth | Purpose |
|-----------------------|----------|--------|------|---------|
| Click "$ analyze"     | Navigate to `/analyze?repo={input}&output={type}` | — | — | Pass pre-filled values to Analyze page |
| Click analysis card   | Navigate to `/analysis/:id` | — | — | View analysis result |
| Click "$ explore"     | Navigate to `/explore` | — | — | Browse more analyses |
| Click "$ feed"        | Navigate to `/feed` | — | — | View full feed |

---

## 8. User Interactions

### Mouse / Touch

| Element | Action | Result |
|---------|--------|--------|
| Repo input | Type | Updates `repoInput` |
| Repo input | Focus | Border green highlight |
| Repo input | Enter | Navigate to `/analyze?repo={input}` |
| Output type buttons | Click | Toggle selection, persisted to analyze page |
| "$ analyze" CTA | Click | If auth: navigate to `/analyze` with params. If not: `/login` |
| Analysis preview card | Click | Navigate to `/analysis/:id` |
| "$ explore --more" | Click | Navigate to `/explore` |
| "$ feed --more" | Click | Navigate to `/feed` |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus repo input |
| `Enter` | Submit → navigate to analyze |
| `g` then `a` | Go to `/analyze` |

---

## 9. Loading State

- Hero section renders immediately (no API dependency)
- Popular analyses: 3 skeleton cards with pulsing opacity
- Recent shared: 3 skeleton rows with pulsing opacity
- How It Works: static content, always visible

---

## 10. Empty State

### No Popular Analyses (fresh platform)

```
┌─ Popular Analyses ─────────────────────────┐
│                                              │
│  $ ls analyses/popular                       │
│  > 0 analyses found.                         │
│                                              │
│  Be the first to analyze a repo!             │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 11. Authenticated vs Unauthenticated

| Element | Unauthenticated | Authenticated |
|---------|----------------|---------------|
| Hero CTA | "$ analyze" → redirects to `/login` | "$ analyze" → navigates to `/analyze` |
| Header | [Login] button | @username dropdown |
| Popular analyses | Visible | Visible |
| Recent shared | Visible | Visible |
| Sidebar | Full nav (read-only for auth-required pages) | Full nav |

---

## 12. Test IDs (`data-testid`)

| Element | `data-testid` | Purpose |
|---------|---------------|---------|
| Hero section | `home-hero` | E2E: verify hero renders |
| Repo input | `home-repo-input` | E2E: type repo name |
| Output type: report | `home-output-report` | E2E: select output |
| Output type: pptx | `home-output-pptx` | E2E: select output |
| Output type: video | `home-output-video` | E2E: select output |
| Analyze CTA | `home-analyze-cta` | E2E: click to analyze |
| Popular section | `home-popular` | E2E: verify popular analyses |
| Analysis preview card | `analysis-preview-card` | E2E: click to view |
| How it works | `home-how-it-works` | E2E: verify static content |
| Recent shared | `home-recent-shared` | E2E: verify recent items |

---

## 13. Accessibility Notes

| Requirement | Implementation |
|-------------|---------------|
| Hero form | `role="search"` with `aria-label="Analyze a GitHub repository"` |
| Repo input | `aria-label="GitHub repository (owner/name)"` |
| Output type selector | `role="radiogroup"` with `role="radio"` per option |
| Popular section | `role="region"` with `aria-label="Popular analyses"` |
| Analysis cards | `role="article"` with `aria-labelledby` pointing to repo name |
| CTA button | Clear label: "Start analysis" (not just icon) |

---

## See Also

- [ANALYZE.md](./ANALYZE.md) — Full Analyze page spec (where CTA leads)
- [ANALYSIS_RESULT.md](./ANALYSIS_RESULT.md) — Analysis result detail page
- [EXPLORE.md](./EXPLORE.md) — Trending analyses and repos
- [FEED.md](./FEED.md) — Social feed with shared analyses
- [DESIGN_GUIDE.md](../design/DESIGN_GUIDE.md) — Visual tokens
