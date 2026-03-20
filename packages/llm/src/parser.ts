import { ParseError } from './errors.js';

const CLI_COMMAND_REGEX = /terminal\.social\s+post\s+.+/;

export function parseCliCommand(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith('terminal.social post')) {
    return extractFirstLine(trimmed);
  }

  const fenceMatch = trimmed.match(/```(?:\w*\n)?([\s\S]*?)```/);
  if (fenceMatch) {
    const inner = fenceMatch[1]?.trim() ?? '';
    if (inner.startsWith('terminal.social post')) {
      return extractFirstLine(inner);
    }
  }

  const lineMatch = trimmed.match(CLI_COMMAND_REGEX);
  if (lineMatch) {
    return extractFirstLine(lineMatch[0]);
  }

  throw new ParseError(trimmed);
}

function extractFirstLine(text: string): string {
  return text.split('\n')[0]!.trim();
}
