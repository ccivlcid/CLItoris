import type { LlmProviderInterface } from './types.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { OpenAiProvider } from './providers/openai.js';
import { GeminiProvider } from './providers/gemini.js';
import { GenericApiProvider } from './providers/api.js';
import { ProviderConfigError } from './errors.js';

export interface ProviderCredentials {
  apiKey?: string;
  baseUrl?: string;
}

/**
 * Create an LLM provider using user-supplied credentials.
 * Keys are provided by the user in settings — NOT from environment variables.
 */
export function createProvider(name: string, credentials: ProviderCredentials = {}): LlmProviderInterface {
  switch (name) {
    case 'anthropic': {
      if (!credentials.apiKey) throw new ProviderConfigError('anthropic', 'apiKey');
      return new AnthropicProvider(credentials.apiKey);
    }
    case 'openai': {
      if (!credentials.apiKey) throw new ProviderConfigError('openai', 'apiKey');
      return new OpenAiProvider(credentials.apiKey);
    }
    case 'gemini': {
      if (!credentials.apiKey) throw new ProviderConfigError('gemini', 'apiKey');
      return new GeminiProvider(credentials.apiKey);
    }
    case 'ollama':
      return new GenericApiProvider('ollama', credentials.baseUrl ?? 'http://localhost:11434/v1', credentials.apiKey ?? '');
    case 'openrouter':
      return new GenericApiProvider('openrouter', credentials.baseUrl ?? 'https://openrouter.ai/api/v1', credentials.apiKey ?? '');
    case 'together':
      return new GenericApiProvider('together', credentials.baseUrl ?? 'https://api.together.xyz/v1', credentials.apiKey ?? '');
    case 'groq':
      return new GenericApiProvider('groq', credentials.baseUrl ?? 'https://api.groq.com/openai/v1', credentials.apiKey ?? '');
    case 'cerebras':
      return new GenericApiProvider('cerebras', credentials.baseUrl ?? 'https://api.cerebras.ai/v1', credentials.apiKey ?? '');
    case 'api': {
      if (!credentials.baseUrl) throw new ProviderConfigError('api', 'baseUrl');
      return new GenericApiProvider('custom', credentials.baseUrl, credentials.apiKey ?? '');
    }
    default:
      // Treat unknown providers as generic OpenAI-compatible if baseUrl is provided
      if (credentials.baseUrl) {
        return new GenericApiProvider(name, credentials.baseUrl, credentials.apiKey ?? '');
      }
      throw new Error(`Unknown provider: ${name}`);
  }
}
