import Anthropic from '@anthropic-ai/sdk';
import type { LlmProviderInterface, LlmTransformInput, LlmTransformOutput, LlmTranslateInput } from '../types.js';
import {
  buildTransformMessages,
  buildTranslateMessage,
  parseTransformJson,
  buildCliCommand,
} from '../prompt.js';

export class AnthropicProvider implements LlmProviderInterface {
  name = 'anthropic';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async listModels(): Promise<string[]> {
    return ['claude-sonnet-4-20250514', 'claude-haiku-4-20250414'];
  }

  async transform(input: LlmTransformInput): Promise<LlmTransformOutput> {
    const { system, userMessage } = buildTransformMessages(input.message);

    const response = await this.client.messages.create({
      model: input.model,
      max_tokens: 512,
      system,
      messages: [{ role: 'user', content: userMessage }],
    });

    const block = response.content[0];
    const text = block?.type === 'text' ? block.text : '';
    const parsed = parseTransformJson(text, input.lang);

    return {
      messageCli: buildCliCommand(parsed, input.username),
      model: response.model,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      lang: parsed.lang,
      tags: parsed.tags,
      intent: parsed.intent,
      emotion: parsed.emotion,
    };
  }

  async translate(input: LlmTranslateInput): Promise<string> {
    const response = await this.client.messages.create({
      model: input.model,
      max_tokens: 512,
      messages: [{ role: 'user', content: buildTranslateMessage(input) }],
    });

    const block = response.content[0];
    return block?.type === 'text' ? block.text.trim() : '';
  }
}
