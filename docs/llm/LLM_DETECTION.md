# LLM_DETECTION.md — Error Handling, Parsing & Credential Detection

> **Source of truth** for LLM error handling, response parsing, and credential auto-detection.
> See [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) for system prompt, interface, and overview.

---

## 1. Error Handling

All providers must handle errors consistently. The server layer wraps provider calls with the following logic.

| Condition | Behavior |
|---|---|
| **API key missing** | Throw `ProviderConfigError` with message: `"Missing API key for provider: {name}. Set {ENV_VAR} in .env"` |
| **Rate limit (429)** | Return HTTP 429 to the client with `Retry-After` header from upstream. Do not retry automatically. |
| **Timeout** | Default timeout is **30 seconds**. On timeout, throw `ProviderTimeoutError`. The client displays a "Request timed out, try again" message. |
| **Invalid response** | If the LLM response cannot be parsed into a valid CLI command, **retry once** with the same input. If the second attempt also fails, return the raw response with a `parseError: true` flag so the client can display a warning. |
| **Network error** | Throw `ProviderNetworkError`. The client shows a connectivity warning. |

Error class hierarchy (in `packages/llm/src/errors.ts`):

```typescript
export class LlmError extends Error {
  constructor(message: string, public readonly provider: string) {
    super(message);
    this.name = "LlmError";
  }
}

export class ProviderConfigError extends LlmError {
  constructor(provider: string, envVar: string) {
    super(`Missing API key for provider: ${provider}. Set ${envVar} in .env`, provider);
    this.name = "ProviderConfigError";
  }
}

export class ProviderTimeoutError extends LlmError {
  constructor(provider: string, timeoutMs: number) {
    super(`Provider ${provider} timed out after ${timeoutMs}ms`, provider);
    this.name = "ProviderTimeoutError";
  }
}

export class ProviderNetworkError extends LlmError {
  constructor(provider: string, cause?: Error) {
    super(`Network error reaching provider: ${provider}`, provider);
    this.name = "ProviderNetworkError";
    if (cause) this.cause = cause;
  }
}
```

---

## 2. Response Parsing

The parser lives in `packages/llm/src/parser.ts`. Its job: extract a clean `terminal.social post ...` command from whatever the LLM returned.

### Parsing Logic

```typescript
// packages/llm/src/parser.ts

const CLI_COMMAND_REGEX = /terminal\.social\s+post\s+.+/;

/**
 * Extracts a valid terminal.social CLI command from raw LLM output.
 *
 * Handles these cases:
 *   1. LLM returned just the command (ideal) -> return as-is
 *   2. LLM wrapped in code fences (```...```) -> strip fences, extract command
 *   3. LLM added explanation before/after -> find the command line with regex
 *   4. No valid command found -> throw so caller can retry
 */
export function parseCliCommand(raw: string): string {
  const trimmed = raw.trim();

  // Case 1: Raw output is already the command
  if (trimmed.startsWith("terminal.social post")) {
    return extractFirstLine(trimmed);
  }

  // Case 2: Strip markdown code fences
  const fenceMatch = trimmed.match(/```(?:\w*\n)?([\s\S]*?)```/);
  if (fenceMatch) {
    const inner = fenceMatch[1]?.trim() ?? "";
    if (inner.startsWith("terminal.social post")) {
      return extractFirstLine(inner);
    }
  }

  // Case 3: Search for the command anywhere in the output
  const lineMatch = trimmed.match(CLI_COMMAND_REGEX);
  if (lineMatch) {
    return extractFirstLine(lineMatch[0]);
  }

  // Case 4: No valid command found
  throw new ParseError(trimmed);
}

function extractFirstLine(text: string): string {
  return text.split("\n")[0]!.trim();
}

export class ParseError extends Error {
  constructor(public readonly rawOutput: string) {
    super("LLM response did not contain a valid terminal.social post command");
    this.name = "ParseError";
  }
}
```

### Fallback Strategy

When `parseCliCommand` throws a `ParseError`, the caller (provider `transform` method or server route) should:

1. **Retry once** with the same `TransformRequest`. Some models are non-deterministic and a second attempt often succeeds.
2. If the second attempt also throws `ParseError`, return a response with:
   - `messageCli` set to the raw LLM output
   - An additional `parseError: true` flag
3. The client checks `parseError` and displays a yellow warning: "Could not generate CLI command. Showing raw LLM output."

---

## 3. Credential Auto-Detection

CLItoris detects locally available LLM credentials at server startup. If a provider's credentials are already configured on the user's machine (e.g., via CLI login or config files), no additional API key is needed. The UI displays detected providers with a "ready" badge.

### Detection Logic

```typescript
// packages/llm/src/credential-detector.ts
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

interface DetectedProvider {
  provider: string;
  source: string;           // where the credential was found
  isAvailable: boolean;
}

/**
 * Scans the local machine for pre-existing LLM credentials.
 * Called once at server startup. Results cached in memory.
 */
export function detectLocalCredentials(): DetectedProvider[] {
  const home = homedir();
  const results: DetectedProvider[] = [];

  // 1. Anthropic — ~/.anthropic/config.json or ANTHROPIC_API_KEY env
  const anthropicConfig = path.join(home, ".anthropic", "config.json");
  if (process.env.ANTHROPIC_API_KEY) {
    results.push({ provider: "anthropic", source: "env:ANTHROPIC_API_KEY", isAvailable: true });
  } else if (existsSync(anthropicConfig)) {
    results.push({ provider: "anthropic", source: `file:${anthropicConfig}`, isAvailable: true });
  }

  // 2. OpenAI — ~/.openai/config or OPENAI_API_KEY env
  const openaiConfig = path.join(home, ".config", "openai", "auth.json");
  if (process.env.OPENAI_API_KEY) {
    results.push({ provider: "openai", source: "env:OPENAI_API_KEY", isAvailable: true });
  } else if (existsSync(openaiConfig)) {
    results.push({ provider: "openai", source: `file:${openaiConfig}`, isAvailable: true });
  }

  // 3. Google Gemini — ~/.config/gcloud/application_default_credentials.json
  //    or GOOGLE_API_KEY / GEMINI_API_KEY env
  const gcloudAdc = path.join(home, ".config", "gcloud", "application_default_credentials.json");
  const geminiConfig = path.join(home, ".config", "gemini", "config.json");
  if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) {
    results.push({ provider: "gemini", source: "env:GOOGLE_API_KEY", isAvailable: true });
  } else if (existsSync(gcloudAdc)) {
    results.push({ provider: "gemini", source: `file:${gcloudAdc}`, isAvailable: true });
  } else if (existsSync(geminiConfig)) {
    results.push({ provider: "gemini", source: `file:${geminiConfig}`, isAvailable: true });
  }

  // 4. Ollama — check if server is running on localhost:11434
  // (detected asynchronously at startup via health check)

  // 5. CLI tools — check if binaries exist in PATH
  const cliTools = ["claude", "codex", "gemini", "opencode"] as const;
  for (const tool of cliTools) {
    try {
      const { execSync } = require("node:child_process");
      execSync(`which ${tool}`, { stdio: "ignore" });
      results.push({ provider: `cli:${tool}`, source: `path:${tool}`, isAvailable: true });
    } catch {
      // binary not found — skip
    }
  }

  return results;
}
```

### Detection Sources (Priority Order)

| Provider | Source 1 (env var) | Source 2 (config file) | Source 3 (system) |
|----------|-------------------|----------------------|-------------------|
| **Anthropic** | `ANTHROPIC_API_KEY` | `~/.anthropic/config.json` | — |
| **OpenAI** | `OPENAI_API_KEY` | `~/.config/openai/auth.json` | — |
| **Gemini** | `GOOGLE_API_KEY` or `GEMINI_API_KEY` | `~/.config/gcloud/application_default_credentials.json` or `~/.config/gemini/config.json` | `gcloud auth` login |
| **Ollama** | `OLLAMA_URL` | — | `localhost:11434` health check |
| **CLI tools** | — | — | `which claude/codex/gemini/opencode` |

### API Endpoint for Detection

```
GET /api/llm/providers
```

Returns the list of available providers with their detection status:

```json
{
  "data": [
    { "provider": "anthropic", "source": "env:ANTHROPIC_API_KEY", "isAvailable": true },
    { "provider": "gemini", "source": "file:~/.config/gcloud/application_default_credentials.json", "isAvailable": true },
    { "provider": "openai", "source": null, "isAvailable": false },
    { "provider": "ollama", "source": "localhost:11434", "isAvailable": true },
    { "provider": "cli:claude", "source": "path:claude", "isAvailable": true }
  ]
}
```

### Client UI Integration

The composer's model selector shows a badge for auto-detected providers:

```
┌─ Model Selector ──────────────────────┐
│ ● anthropic / claude-sonnet  [ready]  │  ← env var detected
│ ● gemini / gemini-2.5-pro   [ready]  │  ← gcloud login detected
│ ○ openai / gpt-4o           [setup]  │  ← no credentials found
│ ● ollama / llama3            [local]  │  ← running locally
│ ● cli / claude-code          [path]   │  ← binary in PATH
└───────────────────────────────────────┘
```

**Badge meanings:**
| Badge | Meaning |
|-------|---------|
| `[ready]` | API key found (env or config file) — usable immediately |
| `[local]` | Local server running — usable immediately |
| `[path]` | CLI binary found in PATH — usable immediately |
| `[setup]` | No credentials detected — click to configure |

---

## See Also

- [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) -- Overview, system prompt, provider interface, execution modes
- [LLM_PROVIDERS.md](./LLM_PROVIDERS.md) -- All 7 provider implementations
- [docs/specs/API.md](./API.md) -- API specification
- [docs/guides/ENV.md](../guides/ENV.md) -- Environment variables (API keys)
