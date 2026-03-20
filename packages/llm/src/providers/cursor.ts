import type { LlmProviderInterface, LlmTransformInput, LlmTransformOutput, LlmTranslateInput } from '../types.js';
import {
  buildTransformMessages,
  buildTranslateMessage,
  parseTransformJson,
  buildCliCommand,
} from '../prompt.js';

function cursorLlmBase(): string {
  return (process.env['CURSOR_LLM_BASE'] ?? 'http://localhost:3100/v1').replace(/\/$/, '');
}

export class CursorProvider implements LlmProviderInterface {
  name = 'cursor';

  async listModels(): Promise<string[]> {
    const res = await fetch(`${cursorLlmBase()}/models`);
    const data = (await res.json()) as { data: Array<{ id: string }> };
    return data.data.map((m) => m.id);
  }

  async transform(input: LlmTransformInput): Promise<LlmTransformOutput> {
    const { system, userMessage } = buildTransformMessages(input.message);

    const res = await fetch(`${cursorLlmBase()}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: input.model,
        max_tokens: 512,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage?: { total_tokens: number };
    };

    const text = data.choices[0]?.message?.content ?? '';
    const parsed = parseTransformJson(text, input.lang);

    return {
      messageCli: buildCliCommand(parsed, input.username),
      model: data.model,
      tokensUsed: data.usage?.total_tokens ?? 0,
      lang: parsed.lang,
      tags: parsed.tags,
      intent: parsed.intent,
      emotion: parsed.emotion,
    };
  }

  async translate(input: LlmTranslateInput): Promise<string> {
    const res = await fetch(`${cursorLlmBase()}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: input.model,
        max_tokens: 512,
        messages: [{ role: 'user', content: buildTranslateMessage(input) }],
      }),
    });

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    return data.choices[0]?.message?.content?.trim() ?? '';
  }
}
