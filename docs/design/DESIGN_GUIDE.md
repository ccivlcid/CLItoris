# DESIGN GUIDE — Forkverse Visual System

> **Source of truth** for all visual design, colors, typography, component specs, and UI states.
> Every pixel must feel like a terminal. If it looks like a generic web app, it's wrong.

This guide is split into focused sub-documents for easier navigation:

| Document | Contents |
|----------|----------|
| **DESIGN_GUIDE.md** (this file) | Design philosophy, color system, typography, layout |
| [DESIGN_COMPONENTS.md](./DESIGN_COMPONENTS.md) | Component specifications (Post Card, Sidebar, Composer, Header, etc.) |
| [DESIGN_STATES.md](./DESIGN_STATES.md) | Interaction states, animations, dark mode, loading/empty/error states |
| [DESIGN_UI.md](./DESIGN_UI.md) | Iconography, responsive rules, accessibility, modals, toasts, forms, z-index, scrollbar, focus management |

---

## 1. Design Philosophy

- **Terminal-first**: The entire UI mimics a CLI environment — dark backgrounds, monospace fonts, green glowing text
- **Dual-format**: Every post shows natural language (left) and CLI command (right) side by side
- **Minimal chrome**: No rounded cards, no gradients, no shadows. Borders are thin. Content is king
- **Information density**: Show more, decorate less. Inspired by `htop`, not Instagram

---

## 2. Color System

> Canonical values live in [`tokens.json`](./tokens.json). Tables below are human-readable references.

### Base Palette

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--bg-primary` | `#1a1a2e` | `bg-[#1a1a2e]` | Main background |
| `--bg-secondary` | `#16213e` | `bg-[#16213e]` | Sidebar, cards |
| `--bg-surface` | `#0f3460` | `bg-[#0f3460]` | Elevated surfaces, modals |
| `--bg-input` | `#0d1117` | `bg-[#0d1117]` | Input fields, code blocks |
| `--bg-hover` | `#1e293b` | `bg-[#1e293b]` | Hover state for interactive elements |

### Text Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--text-primary` | `#e2e8f0` | `text-gray-200` | Body text, natural language |
| `--text-secondary` | `#94a3b8` | `text-gray-400` | Timestamps, metadata |
| `--text-muted` | `#64748b` | `text-gray-500` | Placeholder, disabled |
| `--text-inverse` | `#0f172a` | `text-gray-900` | Text on bright backgrounds |

### Semantic Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--cli-keyword` | `#4ade80` | `text-green-400` | CLI commands, flags (`post`, `--user`) |
| `--cli-string` | `#fbbf24` | `text-amber-400` | CLI string values, usernames |
| `--cli-flag` | `#38bdf8` | `text-sky-400` | CLI flag names (`--lang`, `--tags`) |
| `--hashtag` | `#22d3ee` | `text-cyan-400` | Hashtags (`#vibe-coding`) |
| `--mention` | `#60a5fa` | `text-blue-400` | Mentions (`@username`) |
| `--lang-tag` | `#a78bfa` | `text-purple-400` | Language badges (`--lang=ko`) |
| `--prompt` | `#fb923c` | `text-orange-400` | Prompt symbol (`$`, `>`) |
| `--error` | `#f87171` | `text-red-400` | Error messages |
| `--success` | `#34d399` | `text-emerald-400` | Success indicators |
| `--star` | `#facc15` | `text-yellow-400` | Star/favorite active |

### Border Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--border-default` | `#334155` | `border-gray-700` | Card borders, dividers |
| `--border-hover` | `#475569` | `border-gray-600` | Hover state borders |
| `--border-active` | `#4ade80` | `border-green-400` | Active/focused borders |

---

## 3. Typography

### Font Stack

```css
/* CLI / code — primary font */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;

/* Natural language text */
--font-sans: 'Inter', 'system-ui', '-apple-system', sans-serif;
```

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 24px / `text-2xl` | 700 | 1.2 | Page titles |
| `heading` | 18px / `text-lg` | 600 | 1.3 | Section headers |
| `body` | 14px / `text-sm` | 400 | 1.6 | Natural language posts |
| `code` | 13px / `text-[13px]` | 400 | 1.5 | CLI commands |
| `caption` | 12px / `text-xs` | 400 | 1.4 | Timestamps, counters |
| `badge` | 11px / `text-[11px]` | 500 | 1.0 | Tags, labels |

### Rules

- CLI panel: always `font-mono`
- Natural language panel: `font-sans` for readability
- Sidebar navigation: `font-mono`
- Never use font sizes below 11px
- Never use font weight above 700

---

## 4. Layout System

### Page Structure

```
┌──────────────────────────────────────────────────────────────┐
│ Header Bar (h-10)                                            │
│ terminal.social / breadcrumb path                            │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│ Sidebar    │  Main Content Area                              │
│ (w-56)     │  (flex-1)                                       │
│            │                                                 │
│ fixed      │  (Composer Modal — triggered by [+ post]       │
│ left       │   button in HeaderBar or "/" hotkey)            │
│            │                                                 │
│            │  ┌─ Post Card ────────────────────────────┐     │
│            │  │ ┌─ Natural ──┐  ┌─ CLI ──────────────┐ │     │
│            │  │ │            │  │                     │ │     │
│            │  │ └────────────┘  └─────────────────────┘ │     │
│            │  │ actions: reply · fork · star             │     │
│            │  └────────────────────────────────────────┘     │
│            │                                                 │
│            │  ┌─ Post Card ────────────────────────────┐     │
│            │  │ ...                                     │     │
│            │  └────────────────────────────────────────┘     │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

### Grid & Spacing

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--spacing-xs` | 4px | `p-1`, `gap-1` | Inline spacing |
| `--spacing-sm` | 8px | `p-2`, `gap-2` | Between small elements |
| `--spacing-md` | 16px | `p-4`, `gap-4` | Card padding, section gaps |
| `--spacing-lg` | 24px | `p-6`, `gap-6` | Between cards |
| `--spacing-xl` | 32px | `p-8`, `gap-8` | Page margins |

### Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| `mobile` | < 640px | Sidebar hidden, dual panel stacks vertically |
| `tablet` | 640–1024px | Sidebar collapsible, dual panel side by side |
| `desktop` | > 1024px | Full layout |

---

## Do / Don't Quick Reference

| Do | Don't |
|----|-------|
| Use monospace font for CLI elements | Use decorative fonts |
| Use thin 1px borders | Use thick borders or shadows |
| Use Unicode symbols for icons | Import icon libraries |
| Stack panels vertically on mobile | Hide CLI panel on mobile |
| Use `transition-colors` only | Add bounce/slide animations |
| Keep surfaces flat | Add gradients or glassmorphism |
| Use terminal green as accent | Use rainbow colors |
| Show information densely | Add excessive whitespace |
| Use `rounded-none` or `rounded-sm` | Use `rounded-lg` or `rounded-full` |
| Keep backgrounds under 3 shades | Use many background variations |

---

## B-plan: Analysis UI Design Principles

> Added 2026-03-21 for the Repo Analysis Platform pivot.

### Analyze First, Social Second

The visual hierarchy must reflect the product priority:
1. **Home page**: Hero section with Analyze CTA is the largest, most prominent element
2. **Navigation**: Analyze appears first in sidebar and center in mobile nav
3. **Feed cards**: Analysis result cards are visually distinct from regular post cards (repo badge, section preview)

### CLI Aesthetic for Analysis, Readable UI for Results

- **Analysis input**: Full CLI aesthetic (`$ analyze --repo=`, green text, monospace)
- **Progress display**: Terminal-style step output (`✓ done`, `░░░ active`, `pending`)
- **Result sections**: Switch to **readable font-sans** for body text — analysis results must be easy to read
- **Section headers**: Remain monospace green (`// architecture`, `// strengths`)
- **Rule**: CLI is the brand expression layer; body text prioritizes readability over aesthetics

### Mobile-First Analysis UX

- Single-column form layout on mobile
- Sticky bottom CTA button when scrolling
- Section cards as scrollable stack
- Bottom sheet selectors instead of dropdowns
- Min 44x44px touch targets on all interactive elements

---

## 5. Terminal Visual Texture & FX

To achieve a true "Social Terminal" feel, the UI employs subtle CRT-inspired visual effects.

### 5.1 CRT Scanlines
A fixed overlay providing horizontal lines across the entire viewport.
- **Style**: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))`
- **Usage**: Applied to a `::after` pseudo-element on the main layout container.
- **Opacity**: `0.05` to `0.08` (must be extremely subtle).

### 5.2 Font Glow (Green Text Only)
Monospace green text (`--accent-green`) should have a slight outer glow to simulate old CRT phosphors.
- **Style**: `text-shadow: 0 0 4px rgba(74, 222, 128, 0.4);`
- **Application**: Applied only to CLI commands, prompts, and headers. Never apply to natural language body text.

### 5.3 Film Grain / Noise
A static or slightly animated noise texture to break up large flat background areas.
- **Style**: A high-frequency, low-opacity noise PNG or SVG.
- **Usage**: Applied as a background-image to the `body`.

### 5.4 Screen Flicker (Interaction Only)
A very fast, subtle opacity flicker when a major action occurs (e.g., submitting an analysis).
- **Duration**: `100ms`
- **Effect**: `opacity: 0.95` to `1.0` (simulates power draw on a real tube).

---

## 6. Social Identity & System Personas

User profiles are treated as "System Entities" rather than traditional social media profiles.

### 6.1 ASCII Art Branded Headers
Every user profile should have an ASCII art representation of their name or a default "User Avatar" made of characters.
- **Rule**: Minimum 5 lines high, maximum 10 lines.
- **Font**: Monospace only.

### 6.2 The "Finger" Protocol Experience
When visiting a profile, the initial load should feel like the result of a `finger @username` command.
- Information should be grouped into **System blocks**: Login, Directory, Shell, Activity.

### 6.3 Activity as "Commit Logs"
User social activity (posts, stars, forks) is visualized as a `git log`.
- Use a vertical pipe (`|`) and asterisk (`*`) to connect events chronologically.

---

## 7. Export & Print Theme (Analysis Reports)

When exporting analysis results to PPT or PDF, the visual system adapts for high readability and professional presentation while retaining the "Terminal" brand identity.

### 7.1 High-Contrast Mode (Ink-Saving)
- **Background**: Reverts to **Solid White** (`#FFFFFF`) or very Light Gray (`#F8F9FA`).
- **Text**: Monospace green (`--accent-green`) is replaced by a high-contrast **Dark Green** (`#065F46`).
- **CLI Panels**: Retain a dark background (`#1A1A1A`) to stand out, but with 100% white text for extreme clarity.
- **Rules**: Remove all scanlines, noise, and glow effects for print.

### 7.2 Slide Layout Rules (16:9 Aspect Ratio)
- **Grid**: Use a 12-column grid for PPT slide layouts.
- **Information Density**: Maximum **3 sections per slide**.
- **Terminal Window Frame**: Wrap each section or the entire slide in a 1px solid black border with a "Window Bar" (`_ [] X`) at the top to maintain the OS/CLI aesthetic.
- **Section Headers**: Use `// architecture` or `// executive-summary` with a light-gray background block behind the text.

### 7.3 Font Optimization for Print
- **Mono**: Switch to **JetBrains Mono** exclusively (highly legible in print).
- **Sans**: Switch to **Inter** for all body text results.
- **Sizes**: Minimum 12pt for body text on slides; 14pt for headers.

---

## See Also

- [tokens.json](./tokens.json) — Machine-readable design tokens (colors, typography, spacing, breakpoints, animations)
- [DESIGN_COMPONENTS.md](./DESIGN_COMPONENTS.md) — Component specifications (including B-plan analysis components)
- [DESIGN_STATES.md](./DESIGN_STATES.md) — Interaction states, loading/empty/error
- [DESIGN_UI.md](./DESIGN_UI.md) — Icons, responsive, accessibility, forms
- [CONVENTIONS.md](../guides/CONVENTIONS.md) — Tailwind-only rule, naming conventions
- [Screen specs](../screens/) — Page-by-page wireframes using these design tokens
- [PROMPTS.md](../guides/PROMPTS.md) — Component creation prompt templates
- [MOBILE.md](../specs/MOBILE.md) — Mobile responsive guidelines
