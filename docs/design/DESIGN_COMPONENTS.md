# DESIGN COMPONENTS — Component Specifications

> Part of the [Design Guide](./DESIGN_GUIDE.md). Detailed specifications for all reusable UI components.

---

## 1. Post Card (Dual Format)

```
@jiyeon_dev  jiyeon.kim · 3m ago                               --lang=ko
┌─────────────────────────┬──────────────────────────────────────┐
│ ⓘ 자연어                │ ⊡ CLI — open source            copy │
│                         │                                      │
│ 바이브코딩하다가...      │ post --user=jiyeon.kim --lang=ko ¶  │
│ #vibe-coding #thoughts  │   --message="observing AI-lang..." ¶│
│                         │   --tags=vibe-coding,thoughts ¶      │
│                         │   --visibility=public                │
└─────────────────────────┴──────────────────────────────────────┘
  ↵ reply 14   ○ fork 7   ★ star 42
```

**Specifications:**

| Property | Value |
|----------|-------|
| Border | `border border-gray-700 rounded-none` |
| Background | `bg-[#16213e]` |
| Padding | `p-0` (inner panels handle padding) |
| Natural panel bg | `bg-[#16213e]` |
| CLI panel bg | `bg-[#0d1117]` |
| Panel split | `grid grid-cols-2` (desktop), `grid grid-cols-1` (mobile) |
| Username | `text-amber-400 font-mono font-semibold` |
| Timestamp | `text-gray-500 text-xs` |
| Lang badge | `text-purple-400 text-[11px] border border-purple-400/30 px-1.5 py-0.5` (right side of header row) |
| Natural panel label | `ⓘ 자연어` — info icon + localized label, `text-gray-600 text-xs font-mono` |
| CLI panel label | `⊡ CLI — open source` — terminal block icon, hyphen separator, `text-gray-600 text-xs font-mono` |
| Hashtags | `text-cyan-400` (inline in post text) |
| CLI line continuation | `¶` (pilcrow character), `text-gray-600` |
| Translated text | `text-gray-400 text-sm italic border-l-2 border-purple-400/30 pl-2 mt-2` |
| Translated-from badge | `text-purple-400/50 text-[10px] font-mono` (`--translated-from=ko`) |

**JSX Implementation Reference:**

```tsx
<article className="border border-gray-700 rounded-none overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-2">
    <div className="flex items-center gap-2">
      <span className="text-amber-400 font-mono font-semibold">@{username}</span>
      {domain && <span className="text-gray-500 text-xs">{domain}</span>}
      <span className="text-gray-500 text-xs">· {timeAgo}</span>
    </div>
    <span className="text-purple-400 text-[11px] border border-purple-400/30 px-1.5 py-0.5">
      --lang={lang}
    </span>
  </div>

  {/* Dual Panel */}
  <div className="grid grid-cols-1 sm:grid-cols-2">
    <div className="bg-[#16213e] p-4 text-gray-200 font-sans text-sm">
      <div className="text-gray-600 text-xs font-mono mb-2">ⓘ 자연어</div>
      {messageRaw}
    </div>
    <div className="bg-[#0d1117] p-4 text-green-400 font-mono text-[13px]">
      <div className="flex items-center justify-between text-gray-600 text-xs font-mono mb-2">
        <span>⊡ CLI — open source</span>
        <button className="hover:text-gray-300">copy</button>
      </div>
      <pre className="whitespace-pre-wrap">{messageCli}</pre>
    </div>
  </div>

  {/* Action Bar */}
  <div className="border-t border-gray-700 px-4 py-2 flex gap-6 text-gray-500 text-xs font-mono">
    <button className="hover:text-green-400">↵ reply {replyCount}</button>
    <button className="hover:text-blue-400">○ fork {forkCount}</button>
    <button className="hover:text-yellow-400">{isStarred ? '★' : '☆'} {starCount}</button>
  </div>
</article>
```

| Property | Value |
|----------|-------|
| Action bar | `border-t border-gray-700 px-4 py-2 text-gray-500 text-xs` |
| Action hover | `hover:text-green-400` (reply), `hover:text-blue-400` (fork), `hover:text-yellow-400` (star) |
| Reply icon | `↵` (not `↩`) |
| Fork icon | `○` (not `◇`) |
| Copy button | `text-gray-600 hover:text-gray-300 text-xs` (inside CLI panel header, not action bar) |

---

## 2. Sidebar Navigation

```
┌────────────────┐
│ // navigate    │  ← section label (text-gray-600, text-xs)
│ $ feed --global│  ← active item (text-green-400, bg-[#0f3460])
│ $ feed --local │  ← inactive item (text-gray-400)
│ $ following    │
│ $ explore      │
│                │
│ // my LLM      │  ← section name
│ ● claude-sonnet│  ← dot indicator (green = active)
│ ○ gpt-4o       │  ← dot indicator (gray = inactive)
│ ○ llama-3      │
│ + connect LLM  │  ← links to /settings?tab=cli
│                │
│ // me          │
│ ~ @you.local   │  ← tilde prefix
│ $ my posts --raw│  ← $ prefix, --raw flag
│ $ starred      │  ← $ prefix
└────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| Width | `w-56` fixed |
| Background | `bg-[#1a1a2e]` |
| Border right | `border-r border-gray-700` |
| Section label | `text-gray-600 text-xs font-mono uppercase tracking-wider` |
| Section prefix | `//` in `text-gray-700` |
| Active item | `text-green-400 bg-[#0f3460] pl-3 border-l-2 border-green-400` |
| Inactive item | `text-gray-400 hover:text-gray-200 pl-3` |
| Prompt symbol | `$` in `text-orange-400` (active), `text-gray-600` (inactive) |
| LLM section name | `// my LLM` (not `// by LLM`) |
| LLM connect button | `+ connect LLM` at bottom of LLM section; links to `/settings?tab=cli`; `text-gray-500 hover:text-green-400 text-xs font-mono` |
| Me section username | `~` tilde prefix (not `→` arrow); `text-amber-400 font-mono` |
| Me section nav items | `$` prefix with flag suffixes where applicable (e.g., `$ my posts --raw`, `$ starred`) |
| Item padding | `py-1.5 px-3` |
| Section gap | `mt-6` |

---

## 3. Composer Modal

Opened via `[+ post]` button in HeaderBar or `/` hotkey. Full-screen centered modal with backdrop.

```
┌─────────────────────────────────────────────────────────────┐
│ $ new post                                          [esc]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Write your thoughts...                                     │
│  (textarea, 5 rows, auto-focus)                             │
│                                                             │
│  [CLI preview area — shown after transform]                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [repo] [lang ▾]              model badge   [preview] [post] │
└─────────────────────────────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|----------|-------|
| Backdrop | `bg-black/60`, click to close |
| Modal | `bg-[var(--bg-surface)]`, `max-w-[600px]`, `border border-[var(--border)]` |
| Textarea | transparent bg, `text-[15px] leading-[1.7]`, sans-serif font |
| Footer | border-top, left: attachment buttons, right: actions |
| Submit | `Ctrl+Enter` keyboard shortcut |
| Close | `Escape` key or backdrop click |

---

## 4. Header Bar

```
┌─────────────────────────────────────────────────────────────┐
│ terminal.social / 자연어 + CLI · LLM 공유 · all posts open source │
└─────────────────────────────────────────────────────────────┘
```

The subtitle area shows page-specific context tags separated by `·`. Example shown is for the global feed.

| Property | Value |
|----------|-------|
| Height | `h-10` |
| Background | `bg-[#1a1a2e]` |
| Border bottom | `border-b border-gray-700` |
| Logo | `text-gray-200 font-mono font-bold` |
| Breadcrumb separator | `/` in `text-gray-600` |
| Subtitle tags | `text-gray-400 text-sm font-mono` separated by `·` in `text-gray-600` |
| Breadcrumb item | `text-gray-400 hover:text-gray-200 text-sm font-mono` |

---

## 5. Action Counters

```
↵ reply 5    ○ fork 3    ★ star 42
```

| Property | Default | Hover | Active |
|----------|---------|-------|--------|
| Reply (`↵`) | `text-gray-500` | `text-green-400` | `text-green-400` |
| Fork (`○`) | `text-gray-500` | `text-blue-400` | `text-blue-400` |
| Star (`★`) | `text-gray-500` | `text-yellow-400` | `text-yellow-400` |
| Font | `text-xs font-mono` | — | — |
| Spacing | `gap-6` between actions | — | — |
| Icon | Unicode characters only (no icon library) | — | — |

---

## 6. Language Badge

```
--lang=ko    --lang=en    --lang=hi
```

| Property | Value |
|----------|-------|
| Font | `text-[11px] font-mono` |
| Color | `text-purple-400` |
| Border | `border border-purple-400/30 rounded-sm` |
| Padding | `px-1.5 py-0.5` |
| Position | Top-right corner of post card |

---

## 7. CLI Syntax Highlighting

Inside the CLI panel, apply these colors to different token types:

| Token | Example | Color |
|-------|---------|-------|
| Command | `post`, `star`, `fork` | `text-green-400 font-bold` |
| Flag name | `--user`, `--lang`, `--tags` | `text-sky-400` |
| Flag value (string) | `"hello world"` | `text-amber-400` |
| Flag value (enum) | `public`, `true` | `text-purple-400` |
| Operator | `=` | `text-gray-500` |
| Comment | `#` | `text-gray-600 italic` |
| Line continuation | `¶` (pilcrow) | `text-gray-600` |

---

## B-plan: Analysis Components

> Added 2026-03-21 for the Repo Analysis Platform pivot.

### Analysis Result Card (Feed)

Displayed in feed when a user shares an analysis result.

```
@dev1 · 2h ago                                             --analysis
┌──────────────────────────────────────────────────────────────────┐
│ ▶ vercel/next.js                    report · claude-sonnet      │
│                                                                  │
│ "Production-grade React framework with hybrid rendering          │
│  strategies, Turborepo monorepo, and strong TypeScript adoption" │
│                                                                  │
│ TypeScript 87% · React · Turbopack · Monorepo                   │
│                                                                  │
│ ★ 42  ↗ 5 shares  · 12.3s                                      │
└──────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Border | `border border-gray-700` |
| Background | `bg-[#0d1117]` |
| Repo name | `text-green-400 font-mono font-bold` |
| Summary | `text-gray-300 text-sm` (max 2 lines) |
| Tech badges | `text-cyan-400 text-xs` inline pills |
| Stats | `text-gray-500 text-xs` |

### Analysis Result Section Card (Mobile)

Individual section displayed as a card in the mobile result view.

```
┌─ Executive Summary ─────────────────┐
│                                      │
│  "Next.js is a production-grade     │
│   React framework..."               │
│                                      │
│  [copy]  [share]                    │
└──────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Section header | `text-green-400 font-mono text-sm font-semibold` |
| Content | `text-gray-200 text-sm font-sans` (readable, not monospace) |
| Actions | `text-gray-500 text-xs` buttons, right-aligned |
| Spacing | `mb-3` between cards |

### Home Hero Section

```
┌──────────────────────────────────────────────┐
│  $ analyze --repo=                           │
│                                              │
│  AI-powered GitHub repo analysis.            │
│  Get structured insights in seconds.         │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ owner/repo                        [⏎] │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [report]  [pptx]  [video]                  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ $ analyze                              │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `bg-[#0d1117]` with subtle `border border-gray-800` |
| Command prompt | `text-green-400 font-mono text-lg` |
| Tagline | `text-gray-400 text-sm font-sans` |
| Input | Full-width, `bg-[#161b22] border border-gray-700 text-green-400 font-mono` |
| CTA button | `bg-green-500/20 border border-green-500 text-green-400 font-mono hover:bg-green-500/30` |
| Output pills | `border border-gray-700 text-gray-300 text-xs px-3 py-1` active: `border-green-500 text-green-400` |

### Analysis Progress Steps

... (existing progress steps) ...

---

## 8. ASCII Data Visualization (Charts)

To maintain the terminal aesthetic while providing clear data insights.

### ASCII Bar Chart
Used for language distribution or file type stats.
```
TypeScript [####################----] 82%
JavaScript [###---------------------] 12%
CSS        [#-----------------------]  6%
```
| Property | Value |
|----------|-------|
| Label | `text-gray-300 font-mono text-xs w-20` |
| Bar Background | `text-gray-800` (e.g., `-` characters) |
| Bar Foreground | `text-green-400` (e.g., `#` characters) |
| Percentage | `text-gray-500 font-mono text-xs ml-2` |

### ASCII Trend Line
Used for activity over time.
```
Activity:  _./'""`--.._  (last 30d)
```
| Property | Value |
|----------|-------|
| Line | `text-green-400 font-mono` |

---

## 9. Global Shortcut Hint

A persistent but non-intrusive prompt to guide new users.

```
[? help]
```
- **Position**: Fixed bottom-left (Desktop), inside Header (Mobile).
- **Style**: `text-gray-600 hover:text-green-400 font-mono text-xs cursor-help px-2 py-1 border border-transparent hover:border-gray-800`.

---

## 10. Mobile View Toggle (Dual Panel)

Floating control to switch between Natural and CLI views on small screens.

```
┌─────────────┐
│ Natural CLI │
└─────────────┘
```
| Property | Value |
|----------|-------|
| Position | `fixed bottom-6 right-6 z-40` |
| Container | `bg-[#16213e]/90 backdrop-blur border border-gray-700 p-1 flex gap-1` |
| Active Tab | `bg-[#4ade80]/10 text-[#4ade80] px-3 py-1 text-xs font-mono` |
| Inactive Tab | `text-gray-500 px-3 py-1 text-xs font-mono hover:text-gray-300` |

---

## 11. HTOP-style High-Density Grid (Dashboard)

Used for the Analysis Result Page and system-heavy views to display complex data compactly.

### Dashboard Header (Metric Meters)
```
  Main  [##########----------] 50%    CPU  [##------------------] 10%
  Mem   [#################---] 85%    Disk [#######-------------] 35%
```
- **Structure**: Multi-column grid (`grid-cols-2` or `grid-cols-3`).
- **Bar Style**: Uses the ASCII Bar Chart logic.
- **Coloring**: Green for safe, Amber for medium, Red for critical/high.

### Main Content Area (Data Table)
A structured list with columns, mimicking a process list.
```
  ID    SECTION        TYPE       SCORE   STATUS
  001   architecture   system     [0.8]   STABLE
  002   security       analysis   [0.4]   WARNING
```
| Property | Value |
|----------|-------|
| Header | `bg-[#4ade80] text-[#0f172a] font-bold px-2 py-0.5` (Inverted) |
| Row Hover | `bg-[#1e293b]` (Standard hover) |
| Active Row | `bg-[#4ade80]/20 text-[#4ade80]` |
| Columns | Fixed widths, `font-mono`, `truncate` |

### Function Key Footer (Mapping)
... (existing function key footer) ...

---

## 12. System-style User Profile (Finger/Whois)

Designed to look like a server user information response.

### ASCII Art Avatar & Header
```
  ______               _
 |  ____|             | |
 | |__ ___  _ __ _   _| | _____ _ __ ___  ___
 |  __/ _ \| '__| | | | |/ / _ \ '__/ __|/ _ \
 | | | (_) | |  | |_| |   <  __/ |  \__ \  __/
 |_|  \___/|_|   \__,_|_|\_\___|_|  |___/\___|

 [ @forkverse.dev ]  ID: 1024  Joined: 2026-03-24
```
- **ASCII Name**: Use standard FIGlet fonts (e.g., 'Big') for the username header.
- **Identity Bar**: `text-gray-500 font-mono text-xs` with `[]` brackets for the handle.

### System Info Bio (The "Whois" Block)
```
 Login: @user.local          Name: Forkverse Dev
 Directory: /home/user       Shell: /bin/zsh
 OS: Forkverse 1.0.2         Uptime: 124d 14h
 
 Project: [####################] 100% active
 Influence: [#######-------------] 35% (Stale)
```
- **Key-Value Pairs**: Left-aligned labels (`text-gray-500`), right-aligned values (`text-amber-400`).
- **Layout**: Two-column grid for compactness.

### Git Log-style Activity Feed
Replaces the standard post list with a high-density "commit history" feel.
```
 * 2026-03-24 [post]    Analyzed vercel/next.js (v14.2)
 * 2026-03-23 [star]    Starred facebook/react
 * 2026-03-22 [fork]    Forked @jiyeon_dev's vibe-coding post
 |
 | [view more logs...]
```
| Property | Value |
|----------|-------|
| Bullet (`*`) | `text-gray-600` |
| Date | `text-gray-500 w-24` |
| Action Tag | `[type]` in `text-cyan-400` |
| Description | `text-gray-300 font-mono text-sm hover:text-white truncate` |
| Link | Clicking the description navigates to the post/analysis. |

---

## 13. Dependency Tree Graph (Tree Chart)

Visualizes repository structures or dependency graphs using terminal-native symbols.

### Structural Symbols
Uses Unicode box-drawing characters for connections.
```
  root-project
  │
  ├─┬ src/
  │ │ ├── index.ts
  │ │ └── App.tsx
  │ │
  │ └─┬ components/
  │   ├── Button.tsx
  │   └── Modal.tsx
  │
  └─ package.json
```
| Element | Character | Code |
|---------|-----------|------|
| Vertical Line | `│` | `\u2502` |
| T-Junction | `├` | `\u251C` |
| Corner | `└` | `\u2514` |
| Horizontal | `─` | `\u2500` |
| Node Prefix | `┬` | `\u252C` |

### Interactive Highlighting
- **Hover**: Highlight the hovered node and its direct children with a subtle background (`bg-[#1e293b]`).
- **Path Highlighting**: When a leaf node is selected, highlight the entire path from root to node in `--accent-green`.
- **Folding**: Nodes with children (`┬`) can be toggled. Use `▸` (collapsed) and `▾` (expanded).

### Density Rules
- **Line Height**: `1.4` (slightly more compact than body text).
- **Indentation**: Exactly 2 characters per level.
- **Truncation**: Long file names should truncate with `...` before the extension.

---

## See Also

- [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) — Color system, typography, layout
- [DESIGN_STATES.md](./DESIGN_STATES.md) — Loading, empty, and error states
- [DESIGN_UI.md](./DESIGN_UI.md) — Forms, modals, toasts, accessibility
- [HOME.md](../screens/HOME.md) — Home page wireframes
- [ANALYZE.md](../screens/ANALYZE.md) — Analyze page wireframes
