export class LlmError extends Error {
  constructor(message: string, public readonly provider: string) {
    super(message);
    this.name = 'LlmError';
  }
}

export class ProviderConfigError extends LlmError {
  constructor(provider: string, envVar: string) {
    super(`Missing API key for provider: ${provider}. Set ${envVar} in .env`, provider);
    this.name = 'ProviderConfigError';
  }
}

export class ProviderTimeoutError extends LlmError {
  constructor(provider: string, timeoutMs: number) {
    super(`Provider ${provider} timed out after ${timeoutMs}ms`, provider);
    this.name = 'ProviderTimeoutError';
  }
}

export class ProviderNetworkError extends LlmError {
  constructor(provider: string, cause?: Error) {
    super(`Network error reaching provider: ${provider}`, provider);
    this.name = 'ProviderNetworkError';
    if (cause) this.cause = cause;
  }
}

export class ParseError extends Error {
  constructor(public readonly rawOutput: string) {
    super('LLM response did not contain a valid terminal.social post command');
    this.name = 'ParseError';
  }
}
