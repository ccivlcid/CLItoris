# DESIGN STATES — Interaction, Animation & UI States

> Part of the [Design Guide](./DESIGN_GUIDE.md). Covers interaction states, animation rules, dark mode, loading/empty/error states.

---

## 1. Interaction States

### Buttons & Interactive Elements

| State | Style |
|-------|-------|
| Default | `border border-gray-700 text-gray-400` |
| Hover | `border-gray-500 text-gray-200 bg-[#1e293b]` |
| Active/Pressed | `border-green-400 text-green-400` |
| Focused | `ring-1 ring-green-400/50 outline-none` |
| Disabled | `opacity-40 cursor-not-allowed` |

### Transitions

```
All interactive elements: transition-colors duration-150
No transform animations (scale, rotate, translate)
No bouncing, sliding, or fade-in effects
Opacity transitions allowed for loading states only
```

---

## 2. Animation Rules

> Less is more. This is a terminal, not a magazine.

### Allowed

- `transition-colors duration-150` on hover states
- `opacity` transition for loading/skeleton states
- Cursor blink animation on the composer (terminal cursor feel)

### Banned

- `transform` animations (scale, rotate, translateX/Y)
- `slide-in`, `fade-in`, `bounce`, `spring` effects
- Page transition animations
- Scroll-triggered animations
- Parallax
- Confetti / particle effects
- Skeleton shimmer (use simple opacity pulse)

### Cursor Blink (Composer Only)

```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
/* Apply to composer cursor indicator only */
.cursor-blink {
  animation: blink 1s step-end infinite;
}

@keyframes flicker {
  0% { opacity: 1; }
  10% { opacity: 0.95; }
  20% { opacity: 1; }
  30% { opacity: 0.98; }
  40% { opacity: 1; }
  100% { opacity: 1; }
}

/* Apply to the main app container on major events */
.screen-flicker {
  animation: flicker 0.15s ease-in-out;
}
```

---

## 3. Dark Mode

There is **no light mode**. Dark theme is the only theme.

Do not implement:
- Theme toggle
- `prefers-color-scheme` media query
- Light mode variants
- `dark:` Tailwind prefix (unnecessary since always dark)

---

## 4. Loading States

### Skeleton Post Card

When loading posts, display skeleton placeholders with a pulsing opacity animation. Never use shimmer/sweep effects — use simple opacity pulse only.

**Tailwind classes:** `animate-pulse bg-gray-700/50 rounded`

```
┌─────────────────────────────────────────────────────────────┐
│ ██████████  ████████ · ██████                    ████████   │
├────────────────────────────────┬────────────────────────────┤
│                                │                            │
│  ████████████████████████      │  ██████████████████████    │
│  ██████████████████            │  ████████████████          │
│  ████████████████████████      │  ██████████████████████    │
│  ██████████████                │  ████████████              │
│                                │                            │
├────────────────────────────────┴────────────────────────────┤
│  ██████    ██████    ██████                                 │
└─────────────────────────────────────────────────────────────┘
```

Each `██` block is a `<div>` with `animate-pulse bg-gray-700/50 rounded` applied.

### Feed Loading

- Display **3 skeleton cards** stacked vertically with `gap-6` spacing
- Each card uses the skeleton post card wireframe above
- Cards should have the same dimensions as real post cards

### Single Post Loading

... (existing single post loading) ...

### 4.2 Streaming Text Loading (Analysis)

Used when the AI is analyzing a repository. This replaces or augments the simple pulsing skeleton to provide real-time feedback.

```
> fetching repo metadata...         [DONE]
> analyzing src/index.ts...         [ACTIVE]
> extracting architecture...        [PENDING]
```

**Specifications:**
- **Terminal Style**: Each line appears one by one or scrolls upward.
- **Status Indicators**:
  - `[DONE]`: `text-green-400`
  - `[ACTIVE]`: `text-amber-400` with a pulsing `_` cursor.
  - `[PENDING]`: `text-gray-600`
- **Animation**: Use a "Typewriter" effect for the active line to simulate real-time output.
- **Container**: `bg-[#0d1117] border border-gray-800 p-4 font-mono text-xs overflow-hidden h-32`.

---

## 5. Empty States

All empty states use terminal-style messaging with monospace font and muted colors.

### 5.1 Empty Global Feed

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│           $ cat /feed/global                                │
│           No posts yet. Be the first to post.               │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Prompt: `text-orange-400 font-mono`
- Command: `text-green-400 font-mono`
- Message: `text-gray-400 font-mono text-sm`
- Container: `flex items-center justify-center min-h-[200px]`

### 5.2 Empty Local Feed

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           $ cat /feed/local                                 │
│           You're not following anyone yet.                   │
│           Explore the global feed to find people.            │
│                                                             │
│           ┌──────────────────────────┐                      │
│           │  → Explore Global Feed   │                      │
│           └──────────────────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Message: `text-gray-400 font-mono text-sm`
- CTA button: `bg-green-400/10 text-green-400 border border-green-400/30 px-4 py-2 font-mono text-sm hover:bg-green-400/20`
- Copy line 1: "You're not following anyone yet."
- Copy line 2: "Explore the global feed to find people."

### 5.3 Empty User Profile

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           $ ls /user/username/posts                         │
│           This user hasn't posted yet.                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Message: `text-gray-400 font-mono text-sm`
- Container: `flex items-center justify-center min-h-[150px]`

### 5.4 Empty Starred

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           $ cat /starred                                    │
│           No starred posts yet.                              │
│           Star posts to save them here.                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Star icon: `text-yellow-400` (use `☆` symbol)
- Message: `text-gray-400 font-mono text-sm`
- Container: `flex items-center justify-center min-h-[200px]`

### 5.5 No Search Results

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           $ grep "query" /feed                              │
│           No posts found.                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Message: `text-gray-400 font-mono text-sm`
- Container: `flex items-center justify-center min-h-[150px]`

---

## 5.5. Form Validation States

All form elements follow the same terminal-style validation feedback. Validation messages appear directly below the input with `mt-1`.

### Success State

When a field passes validation after user correction (e.g., settings saved, valid domain entered):

| Property | Value |
|----------|-------|
| Border | `border-emerald-400` |
| Ring | `ring-1 ring-emerald-400/50` |
| Message | `text-emerald-400 text-xs font-mono mt-1` |
| Example | `$ ok: display name updated` |

> Success borders appear briefly (1.5s) then revert to default. Do not persist success styling.

### Warning State

When a field value is technically valid but may cause issues (e.g., bio near max length, unusual domain format):

| Property | Value |
|----------|-------|
| Border | `border-amber-400` |
| Ring | `ring-1 ring-amber-400/50` |
| Message | `text-amber-400 text-xs font-mono mt-1` |
| Example | `$ warn: 280/300 characters used` |

### Error State

When a field fails validation (documented in DESIGN_UI.md §6, repeated here for completeness):

| Property | Value |
|----------|-------|
| Border | `border-red-400` |
| Ring | `ring-1 ring-red-400/50` |
| Message | `text-red-400 text-xs font-mono mt-1` |
| Example | `$ error: username is required` |

### Validation Timing

| Trigger | Behavior |
|---------|----------|
| On blur | Validate the field when the user leaves it |
| On submit | Validate all fields; focus the first invalid field |
| On keyup (after first error) | Re-validate the errored field as the user types |
| Reset | Clear validation state when the user modifies the field value |

### Validation Message Format

All validation messages use terminal prompt style:

```
✅  $ ok: <message>        → text-emerald-400
⚠️  $ warn: <message>      → text-amber-400
❌  $ error: <message>     → text-red-400
```

> The emoji prefixes above are for documentation only. In the actual UI, **do not render emoji**. Use text color alone to distinguish severity.

---

## 6. Error States

### 6.1 404 Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     $ cat /post/unknown                                     │
│     Error: Post not found (404)                              │
│                                                             │
│     The requested resource does not exist.                   │
│     $ cd /feed/global                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Style: terminal-style output with monospace font
- Prompt `$`: `text-orange-400`
- Command: `text-green-400 font-mono`
- Error line: `text-red-400 font-mono font-bold`
- Suggestion: `text-gray-400 font-mono text-sm`
- Container: `flex flex-col items-center justify-center min-h-screen bg-[#1a1a2e]`

### 6.2 500 Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     $ curl terminal.social                                  │
│     Error: Internal server error (500)                       │
│     Try again later.                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Same terminal styling as 404
- Error line: `text-red-400 font-mono font-bold`
- Retry message: `text-gray-400 font-mono text-sm`

### 6.3 Network Error Toast

- Border: `border-l-4 border-red-400`
- Text: `text-red-400`
- Background: `bg-[#16213e]`
- Example message: "Network error. Check your connection."

### 6.4 API Error Toast

- Border: `border-l-4 border-amber-400`
- Text: `text-amber-400`
- Background: `bg-[#16213e]`
- Example message: "Failed to load posts. Please try again."

---

## See Also

- [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) — Color system, typography, layout
- [DESIGN_COMPONENTS.md](./DESIGN_COMPONENTS.md) — Component specifications
- [DESIGN_UI.md](./DESIGN_UI.md) — Forms, modals, toasts, accessibility
