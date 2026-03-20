# LLM_INTEGRATION.md -- LLM Transformation Logic

> **Owner:** CLItoris Core Team
> **Status:** Source of Truth
> **Purpose:** Defines how CLItoris transforms natural language into CLI commands using LLM providers. Core interface, system prompt, execution modes, and provider registration live here. Provider implementations, parsing, and error handling are in split files.

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Prompt](#2-system-prompt)
3. [Provider Interface](#3-provider-interface)
4. [LLM Execution Modes](#4-llm-execution-modes)
5. [Provider Registration](#5-provider-registration)

> **Split files:**
> - [LLM_PROVIDERS.md](./LLM_PROVIDERS.md) — 7 provider implementations (Anthropic, OpenAI, Gemini, Ollama, Cursor, CLI, Generic API)
> - [LLM_DETECTION.md](./LLM_DETECTION.md) — Credential auto-detection, response parsing, error handling

---

## 1. Overview

CLItoris transforms natural language messages into terminal.social CLI commands. The flow:

```
User writes message (natural language)
       |
       v
LLM receives system prompt + user message
       |
       v
LLM outputs a `terminal.social post` CLI command
       |
       v
UI displays BOTH the original message AND the generated CLI command
```

The user types what they want to say. The LLM converts it into a structured CLI `post` command with the appropriate flags. The interface shows the human-readable message alongside its CLI equivalent, giving the feed its terminal aesthetic.

---

## 2. System Prompt

The following is the exact system prompt sent to every LLM provider. It must not be paraphrased or summarized.

```
You are a CLI command generator for terminal.social, a social network with a terminal aesthetic.

Your job: convert a natural language message into a single `terminal.social post` command.

Available flags:
  --user <username>    The posting user (required)
  --lang <code>        Language code, e.g. en, es, fr, ja (required)
  --message "<text>"   The post content in quotes (required)
  --tags <t1,t2,...>   Comma-separated tags, no spaces, no # prefix
  --visibility <v>     One of: public, unlisted, followers, direct (default: public)
  --mention <@user>    Mention another user (repeatable)

Rules:
1. Output ONLY the CLI command. No explanation, no markdown, no commentary.
2. Preserve the original meaning of the message exactly.
3. Infer appropriate tags from the message content (2-5 tags).
4. Keep --message text natural and human — do not make it robotic.
5. If the message mentions or addresses another user, add --mention flags.
6. Default --visibility to public unless the message implies otherwise.
7. The command must be a single line.
```

### Few-Shot Examples

These examples are appended to the system prompt as conversation history.

**Example 1 -- Simple post**

User input:
```
Just deployed my new portfolio site! Really happy with how the animations turned out.
```

Assistant output:
```
terminal.social post --user {username} --lang en --message "Just deployed my new portfolio site! Really happy with how the animations turned out." --tags deployment,portfolio,webdev,animations --visibility public
```

**Example 2 -- Post with mention**

User input:
```
Hey @alice, have you seen the new Rust compiler update? It's mass.
```

Assistant output:
```
terminal.social post --user {username} --lang en --message "Hey @alice, have you seen the new Rust compiler update? It's mass." --tags rust,compiler,update --visibility public --mention @alice
```

**Example 3 -- Non-English post**

User input:
```
Acabo de terminar mi primer proyecto en TypeScript, estoy orgulloso del resultado.
```

Assistant output:
```
terminal.social post --user {username} --lang es --message "Acabo de terminar mi primer proyecto en TypeScript, estoy orgulloso del resultado." --tags typescript,programming,milestone --visibility public
```

---

## 3. Provider Interface

All LLM providers implement the same interface. This lives in `packages/llm/src/types.ts`.

```typescript
interface LlmProvider {
  name: string;
  listModels(): Promise<string[]>;
  transform(input: TransformRequest): Promise<TransformResponse>;
}

interface TransformRequest {
  message: string;
  model: string;
  lang: string;
  username: string;
}

interface TransformResponse {
  messageCli: string;
  model: string;
  tokensUsed: number;
}
```

### Field Details

| Field | Description |
|---|---|
| `TransformRequest.message` | The raw natural language text the user typed. |
| `TransformRequest.model` | Model identifier, e.g. `claude-sonnet-4-20250514`, `gpt-4o`, `llama3`. |
| `TransformRequest.lang` | ISO 639-1 language code detected or chosen by the user. |
| `TransformRequest.username` | The authenticated user's handle, injected into `{username}` in the prompt. |
| `TransformResponse.messageCli` | The complete CLI command string returned by the LLM. |
| `TransformResponse.model` | The model that actually processed the request (may differ from requested if fallback occurred). |
| `TransformResponse.tokensUsed` | Total tokens consumed (prompt + completion). |

---

## 4. LLM Execution Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Cloud API** | Anthropic, OpenAI, Gemini via API keys | Post transformation, repo analysis |
| **Local LLM** | Ollama, llama.cpp installed on user's PC | Offline analysis, privacy-sensitive repos |
| **CLI Tool** | Claude Code, Codex, Gemini CLI | Deep code analysis with tool use |

**Local LLM setup:**
CLItoris provides in-app guidance for installing and managing local models:
```
$ llm --install ollama
> detecting system: Apple M2 Pro, 32GB RAM
> recommended model: llama-3-8b-q4
> downloading... ████████░░ 72%

$ llm --list-local
> ollama/llama-3-8b     (4.7GB, quantized Q4)
> ollama/codellama-13b  (7.3GB, quantized Q4)
```

Users can switch between cloud and local models per task. Local models require no API key and keep all data on-device.

---

## 5. Provider Registration

All providers are registered in a central factory. Adding a new provider requires:
1. Create `packages/llm/src/providers/{name}.ts` implementing `LlmProvider`
2. Register in the factory below
3. Add env var to `docs/guides/ENV.md`
4. Add to model enum in `@clitoris/shared`

```typescript
// packages/llm/src/provider-factory.ts
import type { LlmProvider } from "./types.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { OpenAiProvider } from "./providers/openai.js";
import { GeminiProvider } from "./providers/gemini.js";
import { OllamaProvider } from "./providers/ollama.js";
import { CursorProvider } from "./providers/cursor.js";
import { CliProvider } from "./providers/cli.js";
import { GenericApiProvider } from "./providers/api.js";

export function createProvider(name: string): LlmProvider {
  switch (name) {
    case "anthropic":
      return new AnthropicProvider(process.env.ANTHROPIC_API_KEY!);
    case "openai":
      return new OpenAiProvider(process.env.OPENAI_API_KEY!);
    case "gemini":
      return new GeminiProvider(
        process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY!,
      );
    case "ollama":
      return new OllamaProvider();
    case "cursor":
      return new CursorProvider();
    case "cli":
      return new CliProvider();
    case "api":
      return new GenericApiProvider(
        "custom",
        process.env.API_CUSTOM_BASE_URL!,
        process.env.API_CUSTOM_API_KEY!,
      );
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}
```

---

## See Also

- [LLM_PROVIDERS.md](./LLM_PROVIDERS.md) -- All 7 provider implementations (Anthropic, OpenAI, Gemini, Ollama, Cursor, CLI, Generic API)
- [LLM_DETECTION.md](./LLM_DETECTION.md) -- Error handling, response parsing, credential auto-detection
- [docs/setup/CONFIGS.md](../setup/CONFIGS.md) -- Project configuration files
- [docs/GLOSSARY.md](../GLOSSARY.md) -- Unified terminology index
- [docs/specs/API.md](./API.md) -- API specification
- [docs/specs/PRD.md](./PRD.md) -- Product requirements
- [docs/guides/ENV.md](../guides/ENV.md) -- Environment variables (API keys)
