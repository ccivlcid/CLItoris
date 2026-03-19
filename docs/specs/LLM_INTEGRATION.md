# LLM_INTEGRATION.md -- LLM Transformation Logic

> **Owner:** CLItoris Core Team
> **Status:** Source of Truth
> **Purpose:** Defines how CLItoris transforms natural language into CLI commands using LLM providers. All provider implementations, prompts, parsing, and error handling live here.

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Prompt](#2-system-prompt)
3. [Provider Interface](#3-provider-interface)
4. [Provider Implementations](#4-provider-implementations)
5. [Error Handling](#5-error-handling)
6. [Response Parsing](#6-response-parsing)

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

## 4. Provider Implementations

All providers live under `packages/llm/src/providers/`. Each file exports a class implementing `LlmProvider`.

### 4a. anthropic.ts -- Anthropic SDK

```typescript
// packages/llm/src/providers/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";
import type { LlmProvider, TransformRequest, TransformResponse } from "../types.js";
import { SYSTEM_PROMPT, buildFewShotMessages } from "../prompt.js";
import { parseCliCommand } from "../parser.js";

export class AnthropicProvider implements LlmProvider {
  name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async listModels(): Promise<string[]> {
    return [
      "claude-sonnet-4-20250514",
      "claude-haiku-4-20250414",
    ];
  }

  async transform(input: TransformRequest): Promise<TransformResponse> {
    const response = await this.client.messages.create({
      model: input.model,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        ...buildFewShotMessages(input.username),
        { role: "user", content: input.message },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return {
      messageCli: parseCliCommand(text),
      model: response.model,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  }
}
```

### 4b. openai.ts -- OpenAI SDK

```typescript
// packages/llm/src/providers/openai.ts
import OpenAI from "openai";
import type { LlmProvider, TransformRequest, TransformResponse } from "../types.js";
import { SYSTEM_PROMPT, buildFewShotMessages } from "../prompt.js";
import { parseCliCommand } from "../parser.js";

export class OpenAiProvider implements LlmProvider {
  name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async listModels(): Promise<string[]> {
    const list = await this.client.models.list();
    return list.data
      .filter((m) => m.id.startsWith("gpt-"))
      .map((m) => m.id);
  }

  async transform(input: TransformRequest): Promise<TransformResponse> {
    const response = await this.client.chat.completions.create({
      model: input.model,
      max_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...buildFewShotMessages(input.username),
        { role: "user", content: input.message },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    return {
      messageCli: parseCliCommand(text),
      model: response.model,
      tokensUsed: response.usage?.total_tokens ?? 0,
    };
  }
}
```

### 4c. ollama.ts -- Ollama REST API

```typescript
// packages/llm/src/providers/ollama.ts
import type { LlmProvider, TransformRequest, TransformResponse } from "../types.js";
import { SYSTEM_PROMPT, buildFewShotMessages } from "../prompt.js";
import { parseCliCommand } from "../parser.js";

const OLLAMA_BASE = process.env.OLLAMA_HOST ?? "http://localhost:11434";

export class OllamaProvider implements LlmProvider {
  name = "ollama";

  async listModels(): Promise<string[]> {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    const data = (await res.json()) as { models: Array<{ name: string }> };
    return data.models.map((m) => m.name);
  }

  async transform(input: TransformRequest): Promise<TransformResponse> {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: input.model,
        stream: false,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...buildFewShotMessages(input.username),
          { role: "user", content: input.message },
        ],
      }),
    });

    const data = (await res.json()) as {
      message: { content: string };
      model: string;
      eval_count?: number;
      prompt_eval_count?: number;
    };

    return {
      messageCli: parseCliCommand(data.message.content),
      model: data.model,
      tokensUsed: (data.eval_count ?? 0) + (data.prompt_eval_count ?? 0),
    };
  }
}
```

### 4d. cursor.ts -- Cursor API

```typescript
// packages/llm/src/providers/cursor.ts
import type { LlmProvider, TransformRequest, TransformResponse } from "../types.js";
import { SYSTEM_PROMPT, buildFewShotMessages } from "../prompt.js";
import { parseCliCommand } from "../parser.js";

const CURSOR_BASE = "http://localhost:3100/v1";

export class CursorProvider implements LlmProvider {
  name = "cursor";

  async listModels(): Promise<string[]> {
    const res = await fetch(`${CURSOR_BASE}/models`);
    const data = (await res.json()) as { data: Array<{ id: string }> };
    return data.data.map((m) => m.id);
  }

  async transform(input: TransformRequest): Promise<TransformResponse> {
    const res = await fetch(`${CURSOR_BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: input.model,
        max_tokens: 512,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...buildFewShotMessages(input.username),
          { role: "user", content: input.message },
        ],
      }),
    });

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage?: { total_tokens: number };
    };

    return {
      messageCli: parseCliCommand(data.choices[0]?.message?.content ?? ""),
      model: data.model,
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  }
}
```

### 4e. cli.ts -- CLI Tools (Claude Code, Codex, Gemini CLI, OpenCode)

Spawns a CLI tool as a child process and captures stdout.

```typescript
// packages/llm/src/providers/cli.ts
import { spawn } from "node:child_process";
import type { LlmProvider, TransformRequest, TransformResponse } from "../types.js";
import { SYSTEM_PROMPT } from "../prompt.js";
import { parseCliCommand } from "../parser.js";

interface CliToolConfig {
  bin: string;
  args: (prompt: string) => string[];
}

const CLI_TOOLS: Record<string, CliToolConfig> = {
  "claude-code": {
    bin: "claude",
    args: (prompt) => ["--print", prompt],
  },
  codex: {
    bin: "codex",
    args: (prompt) => ["--quiet", "--prompt", prompt],
  },
  "gemini-cli": {
    bin: "gemini",
    args: (prompt) => ["-p", prompt],
  },
  opencode: {
    bin: "opencode",
    args: (prompt) => ["run", prompt],
  },
};

export class CliProvider implements LlmProvider {
  name = "cli";

  async listModels(): Promise<string[]> {
    return Object.keys(CLI_TOOLS);
  }

  async transform(input: TransformRequest): Promise<TransformResponse> {
    const tool = CLI_TOOLS[input.model];
    if (!tool) throw new Error(`Unknown CLI tool: ${input.model}`);

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${input.username}\nLang: ${input.lang}\nMessage: ${input.message}`;

    const output = await this.exec(tool.bin, tool.args(fullPrompt));

    return {
      messageCli: parseCliCommand(output),
      model: input.model,
      tokensUsed: 0, // CLI tools do not report token usage
    };
  }

  private exec(bin: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(bin, args, { timeout: 30_000 });
      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on("close", (code) => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(`${bin} exited with code ${code}: ${stderr}`));
      });
      child.on("error", reject);
    });
  }
}
```

### 4f. api.ts -- Generic OpenAI-Compatible Endpoint

For any provider that exposes an OpenAI-compatible `/v1/chat/completions` endpoint (LM Studio, vLLM, Together AI, Groq, etc.).

```typescript
// packages/llm/src/providers/api.ts
import type { LlmProvider, TransformRequest, TransformResponse } from "../types.js";
import { SYSTEM_PROMPT, buildFewShotMessages } from "../prompt.js";
import { parseCliCommand } from "../parser.js";

export class GenericApiProvider implements LlmProvider {
  name: string;
  private baseUrl: string;
  private apiKey: string;

  constructor(name: string, baseUrl: string, apiKey: string) {
    this.name = name;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  async listModels(): Promise<string[]> {
    const res = await fetch(`${this.baseUrl}/v1/models`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    const data = (await res.json()) as { data: Array<{ id: string }> };
    return data.data.map((m) => m.id);
  }

  async transform(input: TransformRequest): Promise<TransformResponse> {
    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: input.model,
        max_tokens: 512,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...buildFewShotMessages(input.username),
          { role: "user", content: input.message },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage?: { total_tokens: number };
    };

    return {
      messageCli: parseCliCommand(data.choices[0]?.message?.content ?? ""),
      model: data.model,
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  }
}
```

---

## 5. Error Handling

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

## 6. Response Parsing

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

## See Also

- [docs/setup/CONFIGS.md](../setup/CONFIGS.md) -- Project configuration files
- [docs/OVERVIEW.md](../OVERVIEW.md) -- Project overview and goals
- [docs/specs/API.md](./API.md) -- API specification
- [docs/specs/PRD.md](./PRD.md) -- Product requirements
