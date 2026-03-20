export type PostIntent = 'casual' | 'formal' | 'question' | 'announcement' | 'reaction';
export type PostEmotion = 'neutral' | 'happy' | 'surprised' | 'frustrated' | 'excited' | 'sad' | 'angry';

export interface LlmProviderInterface {
  name: string;
  listModels(): Promise<string[]>;
  transform(input: LlmTransformInput): Promise<LlmTransformOutput>;
  translate(input: LlmTranslateInput): Promise<string>;
}

export interface LlmTransformInput {
  message: string;
  model: string;
  lang: string;
  username: string;
}

export interface LlmTransformOutput {
  messageCli: string;
  model: string;
  tokensUsed: number;
  lang: string;
  tags: string[];
  intent: PostIntent;
  emotion: PostEmotion;
}

export interface LlmTranslateInput {
  message: string;
  sourceLang: string;
  targetLang: string;
  intent: PostIntent;
  emotion: PostEmotion;
  model: string;
}

export interface DetectedProvider {
  provider: string;
  source: string;
  isAvailable: boolean;
}
