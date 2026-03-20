import { GoogleGenAI } from '@google/genai';
import type { LlmProviderInterface, LlmTransformInput, LlmTransformOutput, LlmTranslateInput } from '../types.js';
import {
  buildTransformMessages,
  buildTranslateMessage,
  parseTransformJson,
  buildCliCommand,
} from '../prompt.js';

export class GeminiProvider implements LlmProviderInterface {
  name = 'gemini';
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async listModels(): Promise<string[]> {
    return ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'];
  }

  async transform(input: LlmTransformInput): Promise<LlmTransformOutput> {
    const { system, userMessage } = buildTransformMessages(input.message);

    const response = await this.client.models.generateContent({
      model: input.model,
      config: { systemInstruction: system, maxOutputTokens: 512 },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    });

    const text = response.text ?? '';
    const parsed = parseTransformJson(text, input.lang);

    return {
      messageCli: buildCliCommand(parsed, input.username),
      model: input.model,
      tokensUsed:
        (response.usageMetadata?.promptTokenCount ?? 0) +
        (response.usageMetadata?.candidatesTokenCount ?? 0),
      lang: parsed.lang,
      tags: parsed.tags,
      intent: parsed.intent,
      emotion: parsed.emotion,
    };
  }

  async translate(input: LlmTranslateInput): Promise<string> {
    const response = await this.client.models.generateContent({
      model: input.model,
      config: { maxOutputTokens: 512 },
      contents: [{ role: 'user', parts: [{ text: buildTranslateMessage(input) }] }],
    });

    return (response.text ?? '').trim();
  }
}
