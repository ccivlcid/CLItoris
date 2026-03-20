import type { LlmProviderInterface, LlmTransformInput, LlmTransformOutput, LlmTranslateInput } from '../types.js';
import {
  buildTransformMessages,
  buildTranslateMessage,
  parseTransformJson,
  buildCliCommand,
} from '../prompt.js';

const OLLAMA_BASE = process.env.OLLAMA_URL ?? 'http://localhost:11434';

export class OllamaProvider implements LlmProviderInterface {
  name = 'ollama';

  async listModels(): Promise<string[]> {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    const data = (await res.json()) as { models: Array<{ name: string }> };
    return data.models.map((m) => m.name);
  }

  async transform(input: LlmTransformInput): Promise<LlmTransformOutput> {
    const { system, userMessage } = buildTransformMessages(input.message);

    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: input.model,
        stream: false,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const data = (await res.json()) as {
      message: { content: string };
      model: string;
      eval_count?: number;
      prompt_eval_count?: number;
    };

    const parsed = parseTransformJson(data.message.content, input.lang);

    return {
      messageCli: buildCliCommand(parsed, input.username),
      model: data.model,
      tokensUsed: (data.eval_count ?? 0) + (data.prompt_eval_count ?? 0),
      lang: parsed.lang,
      tags: parsed.tags,
      intent: parsed.intent,
      emotion: parsed.emotion,
    };
  }

  async translate(input: LlmTranslateInput): Promise<string> {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: input.model,
        stream: false,
        messages: [{ role: 'user', content: buildTranslateMessage(input) }],
      }),
    });

    const data = (await res.json()) as { message: { content: string } };
    return data.message.content.trim();
  }
}
