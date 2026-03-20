import { spawn } from 'node:child_process';
import type { LlmProviderInterface, LlmTransformInput, LlmTransformOutput, LlmTranslateInput } from '../types.js';
import {
  buildTransformMessages,
  buildTranslateMessage,
  parseTransformJson,
  buildCliCommand,
} from '../prompt.js';

interface CliToolConfig {
  bin: string;
  args: (prompt: string) => string[];
}

const CLI_TOOLS: Record<string, CliToolConfig> = {
  'claude-code': { bin: 'claude', args: (p) => ['--print', p] },
  codex: { bin: 'codex', args: (p) => ['--quiet', '--prompt', p] },
  'gemini-cli': { bin: 'gemini', args: (p) => ['-p', p] },
  opencode: { bin: 'opencode', args: (p) => ['run', p] },
};

export class CliProvider implements LlmProviderInterface {
  name = 'cli';

  async listModels(): Promise<string[]> {
    return Object.keys(CLI_TOOLS);
  }

  async transform(input: LlmTransformInput): Promise<LlmTransformOutput> {
    const tool = CLI_TOOLS[input.model];
    if (!tool) throw new Error(`Unknown CLI tool: ${input.model}`);

    const { system, userMessage } = buildTransformMessages(input.message);
    const fullPrompt = `${system}\n\n${userMessage}`;
    const output = await this.exec(tool.bin, tool.args(fullPrompt));

    const parsed = parseTransformJson(output, input.lang);

    return {
      messageCli: buildCliCommand(parsed, input.username),
      model: input.model,
      tokensUsed: 0,
      lang: parsed.lang,
      tags: parsed.tags,
      intent: parsed.intent,
      emotion: parsed.emotion,
    };
  }

  async translate(input: LlmTranslateInput): Promise<string> {
    const tool = CLI_TOOLS[input.model];
    if (!tool) throw new Error(`Unknown CLI tool: ${input.model}`);

    const output = await this.exec(tool.bin, tool.args(buildTranslateMessage(input)));
    return output.trim();
  }

  private exec(bin: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      // shell: true matches server CLI detection — required on Windows for npm global .cmd shims
      const child = spawn(bin, args, {
        timeout: 30_000,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
      child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
      child.on('close', (code: number | null) => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(`${bin} exited with code ${String(code)}: ${stderr}`));
      });
      child.on('error', reject);
    });
  }
}
