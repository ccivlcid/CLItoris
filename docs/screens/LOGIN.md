# LOGIN Screen Specification

> **Source of truth** for the Login screen (`/login`).

---

## 1. Screen Overview

| Property        | Value                                                        |
|-----------------|--------------------------------------------------------------|
| **Route**       | `/login`                                                     |
| **Title**       | `connect -- terminal.social`                                 |
| **Description** | Terminal-style connection page using SSH metaphor. Single button to authenticate via GitHub OAuth. No username/password fields. No sidebar -- full-width centered layout. Redirects to `/` if already authenticated. |
| **Auth Required** | No. Redirects to `/` (global feed) if session already exists. |

---

## 2. Desktop Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ terminal.social                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                                                                          │
│                                                                          │
│         ┌─ Connect ────────────────────────────────────────────┐         │
│         │                                                       │         │
│         │  // establish connection                              │         │
│         │                                                       │         │
│         │  $ ssh terminal.social                                │         │
│         │                                                       │         │
│         │  > key not found. authenticate via provider.          │         │
│         │                                                       │         │
│         │  ┌─────────────────────────────────────────────┐      │         │
│         │  │  ■ connect --provider=github    [Enter]     │      │         │
│         │  └─────────────────────────────────────────────┘      │         │
│         │                                                       │         │
│         │  // available permissions                              │         │
│         │  --scope=read:user,user:email                         │         │
│         │                                                       │         │
│         │  info: we only read your public profile.              │         │
│         │  info: no repo access requested.                      │         │
│         │                                                       │         │
│         └───────────────────────────────────────────────────────┘         │
│                                                                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Desktop — Connecting (OAuth in progress)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ terminal.social                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                                                                          │
│         ┌─ Connect ────────────────────────────────────────────┐         │
│         │                                                       │         │
│         │  // establish connection                              │         │
│         │                                                       │         │
│         │  $ ssh terminal.social                                │         │
│         │                                                       │         │
│         │  > redirecting to github.com...                       │         │
│         │  > waiting for authorization ░░░░░░░░░░               │         │
│         │                                                       │         │
│         │  ┌─────────────────────────────────────────────┐      │         │
│         │  │  ■ connecting...                             │      │         │
│         │  └─────────────────────────────────────────────┘      │         │
│         │                                                       │         │
│         └───────────────────────────────────────────────────────┘         │
│                                                                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Desktop — Authentication Success (returning user)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ terminal.social                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                                                                          │
│         ┌─ Connect ────────────────────────────────────────────┐         │
│         │                                                       │         │
│         │  // establish connection                              │         │
│         │                                                       │         │
│         │  $ ssh terminal.social                                │         │
│         │                                                       │         │
│         │  > authenticated via github                           │         │
│         │  > welcome back, @jiyeon_dev                          │         │
│         │                                                       │         │
│         │  session: active                                      │         │
│         │  last-login: 2026-03-18T14:22:00Z                     │         │
│         │                                                       │         │
│         │  redirecting to feed...                               │         │
│         │                                                       │         │
│         └───────────────────────────────────────────────────────┘         │
│                                                                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mobile Wireframe

```
┌─────────────────────────────────┐
│ terminal.social                  │
├─────────────────────────────────┤
│                                  │
│                                  │
│                                  │
│  ┌─ Connect ─────────────────┐  │
│  │                            │  │
│  │  // establish connection   │  │
│  │                            │  │
│  │  $ ssh terminal.social     │  │
│  │                            │  │
│  │  > authenticate via        │  │
│  │    provider.               │  │
│  │                            │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ ■ connect --github   │  │  │
│  │  │          [Enter]     │  │  │
│  │  └──────────────────────┘  │  │
│  │                            │  │
│  │  info: read-only access.  │  │
│  │  no repo permissions.     │  │
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
│                                  │
└─────────────────────────────────┘
```

---

## 4. Component Tree

```
<LoginPage>                            // packages/client/src/pages/LoginPage.tsx
  <AuthLayout>                         // packages/client/src/components/layout/AuthLayout.tsx
    <HeaderBar />                      // packages/client/src/components/layout/HeaderBar.tsx
      └── (logo only, no sidebar, no breadcrumbs)
    <main>                             // centered vertically and horizontally
      <ConnectForm>                    // packages/client/src/components/auth/ConnectForm.tsx
        <SectionLabel />              // "// establish connection"
        <SshPrompt />                 // "$ ssh terminal.social" static text
        <ConnectionStatus />          // packages/client/src/components/auth/ConnectionStatus.tsx
          └── status message (key not found / redirecting / authenticated)
        <GitHubConnectButton />       // packages/client/src/components/auth/GitHubConnectButton.tsx
          └── "■ connect --provider=github [Enter]"
        <ScopeInfo />                 // packages/client/src/components/auth/ScopeInfo.tsx
          └── scope display + info messages
      </ConnectForm>
    </main>
  </AuthLayout>
</LoginPage>
```

---

## 5. State Requirements

### Zustand Stores

**`authStore`** (updated)
```typescript
{
  user: User | null;
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'idle' | 'redirecting' | 'callback' | 'success' | 'error';

  initiateGitHubOAuth: () => void;          // redirect to /api/auth/github
  handleOAuthCallback: (code: string, state: string) => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}
```

### Local Component State (React useState)

```typescript
// ConnectForm local state
{
  isRedirecting: boolean;     // true after clicking connect, before redirect
}
```

No registration form state needed. GitHub handles all credential collection.

---

## 6. API Calls

### On Mount

| Trigger          | Endpoint          | Method | Purpose                                      |
|------------------|-------------------|--------|----------------------------------------------|
| Page load        | `/api/auth/me`    | GET    | Check if already logged in; redirect to `/` if so |

### On User Interaction

| Trigger              | Endpoint              | Method | Purpose                                     |
|----------------------|-----------------------|--------|---------------------------------------------|
| Click connect button | `/api/auth/github`    | GET    | Redirect to GitHub OAuth consent screen     |

### On OAuth Callback (automatic)

| Trigger              | Endpoint                        | Method | Purpose                                |
|----------------------|---------------------------------|--------|----------------------------------------|
| GitHub redirect back | `/api/auth/github/callback`     | GET    | Exchange code for token, create session |

**Callback success (existing user):** Store user in `authStore`, set `connectionStatus` to `'success'`, show welcome message, redirect to `/` after 1.5s.

**Callback success (new user):** Store partial user in `authStore`, redirect to `/setup` for profile configuration.

**Callback failure:** Set `authStore.error`, set `connectionStatus` to `'error'`.

---

## 7. User Interactions

| Element                    | Action            | Result                                                          |
|----------------------------|-------------------|-----------------------------------------------------------------|
| GitHub connect button      | Click             | Sets `isRedirecting=true`, redirects to `/api/auth/github`     |
| GitHub connect button      | Hover             | Border transitions to `border-green-400`, subtle glow           |
| Keyboard: `Enter`          | Press             | Triggers GitHub connect (same as clicking button)               |
| Keyboard: `Escape`         | Press             | No action (single action page)                                  |
| Scope info text            | Displayed         | Static display, not interactive                                 |

No form validation needed — there are no input fields.

---

## 8. Loading State

### OAuth Redirect (after clicking connect)

```
┌─ Connect ────────────────────────────────────────────┐
│                                                       │
│  // establish connection                              │
│                                                       │
│  $ ssh terminal.social                                │
│                                                       │
│  > redirecting to github.com...                       │
│  > waiting for authorization ░░░░░░░░░░               │
│                                                       │
│  ┌─────────────────────────────────────────────┐      │
│  │  ■ connecting...                             │      │
│  └─────────────────────────────────────────────┘      │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**Implementation:**
- Button text changes from `■ connect --provider=github [Enter]` to `■ connecting...`
- Button gets `opacity-40 cursor-not-allowed` styling
- Status messages update with typing animation effect
- The `░` progress bar pulses with opacity animation

### OAuth Callback Processing

When returning from GitHub (on `/login?code=X&state=Y`):
- Show the "connecting..." state immediately
- Status text: `> verifying github authorization...`
- On success, transition to success state with welcome message
- On failure, transition to error state

### Initial Session Check

While checking `/api/auth/me` on mount:
- Show the connect form normally (no skeleton)
- If session exists, redirect happens before user interacts
- Brief flash is acceptable; no full-page loader needed

---

## 9. Empty State

Not applicable for the login page. The connect form is always displayed. There is no data-dependent empty state.

---

## 10. Error State

### OAuth Denied (user cancelled on GitHub)

```
┌─ Connect ────────────────────────────────────────────┐
│                                                       │
│  // establish connection                              │
│                                                       │
│  $ ssh terminal.social                                │
│                                                       │
│  error: github authorization denied (403)             │
│  hint: click connect to try again.                    │
│                                                       │
│  ┌─────────────────────────────────────────────┐      │
│  │  ■ connect --provider=github    [Enter]     │      │
│  └─────────────────────────────────────────────┘      │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### GitHub Account Already Linked (409)

```
  error: this github account is already linked to @other_user (409)
  hint: login with the linked account or contact support.
```

### GitHub API Unreachable (502)

```
  error: github api unreachable (502)
  hint: try again in a few moments.
```

### OAuth State Mismatch (security error)

```
  error: authorization state mismatch (400)
  hint: this may be a security issue. please try again.
```

### Rate Limited (429)

```
  error: too many attempts. try again in 60s (429)
```

### Network Error / Server Down (500)

```
  error: connection failed. please try again (500)
```

**Styling for all errors:**
- Error text: `text-red-400 font-mono text-sm`
- Hint text: `text-yellow-400/70 font-mono text-sm`
- Appears above the connect button
- No border or background on the error line (bare terminal output style)
- Error clears when user clicks connect again

---

## 11. Test IDs (`data-testid`)

| Element | `data-testid` | Purpose |
|---------|---------------|---------|
| GitHub connect button | `github-connect-button` | E2E: initiate OAuth flow |
| Connection status text | `connection-status` | E2E: verify status messages |
| Error message | `login-error` | E2E: verify error display |
| Hint message | `login-hint` | E2E: verify hint text |
| Connect form container | `connect-form` | E2E: verify form visible |
| Scope info section | `scope-info` | E2E: verify permissions display |

---

## 12. Accessibility Notes

| Requirement | Implementation |
|-------------|---------------|
| Form | `role="form"` with `aria-label="Connect to terminal.social via GitHub"` |
| Connect button | `aria-label="Connect with GitHub"`, `aria-disabled="true"` when connecting |
| Status messages | `role="status"` with `aria-live="polite"` for connection updates |
| Error message | `role="alert"` with `aria-live="assertive"` for immediate announcement |
| Scope info | `aria-label="OAuth permissions: read-only profile access"` |
| Loading state | Button text changes to "connecting..." with `aria-busy="true"` |

---

## See Also

- [DESIGN_GUIDE.md](../design/DESIGN_GUIDE.md) — Visual tokens, component specs, UI states
- [API.md](../specs/API.md) — Endpoint request/response details
- [CONVENTIONS.md](../guides/CONVENTIONS.md) — Coding rules for implementation
- [SETUP.md](./SETUP.md) — First-time profile setup (replaces REGISTER.md)
