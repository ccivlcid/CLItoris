import OpenAI from 'openai';
import type { LlmProviderInterface, LlmTransformInput, LlmTransformOutput, LlmTranslateInput } from '../types.js';
import {
  buildTransformMessages,
  buildTranslateMessage,
  parseTransformJson,
  buildCliCommand,
} from '../prompt.js';

export class OpenAiProvider implements LlmProviderInterface {
  name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async listModels(): Promise<string[]> {
    const list = await this.client.models.list();
    return list.data.filter((m) => m.id.startsWith('gpt-')).map((m) => m.id);
  }

  async transform(input: LlmTransformInput): Promise<LlmTransformOutput> {
    const { system, userMessage } = buildTransformMessages(input.message);

    const response = await this.client.chat.completions.create({
      model: input.model,
      max_tokens: 512,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '';
    const parsed = parseTransformJson(text, input.lang);

    return {
      messageCli: buildCliCommand(parsed, input.username),
      model: response.model,
      tokensUsed: response.usage?.total_tokens ?? 0,
      lang: parsed.lang,
      tags: parsed.tags,
      intent: parsed.intent,
      emotion: parsed.emotion,
    };
  }

  async translate(input: LlmTranslateInput): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: input.model,
      max_tokens: 512,
      messages: [{ role: 'user', content: buildTranslateMessage(input) }],
    });

    return response.choices[0]?.message?.content?.trim() ?? '';
  }
}
