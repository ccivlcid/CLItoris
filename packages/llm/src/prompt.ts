import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LlmTranslateInput, PostIntent, PostEmotion } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Legacy system prompt (kept for reference)
export const SYSTEM_PROMPT: string = readFileSync(
  path.join(__dirname, '..', 'prompts', 'system.md'),
  'utf-8',
).trim();

const TRANSFORM_PROMPT_RAW: string = readFileSync(
  path.join(__dirname, '..', 'prompts', 'transform.md'),
  'utf-8',
).trim();

const TRANSLATE_PROMPT_RAW: string = readFileSync(
  path.join(__dirname, '..', 'prompts', 'translate.md'),
  'utf-8',
).trim();

// Split transform prompt: system instructions + user turn template
const TRANSFORM_SYSTEM: string = TRANSFORM_PROMPT_RAW.replace(
  /\nPost: "\{\{USER_INPUT\}\}"\s*$/,
  '',
).trim();

export function buildTransformMessages(message: string): {
  system: string;
  userMessage: string;
} {
  return {
    system: TRANSFORM_SYSTEM,
    userMessage: `Post: "${message}"`,
  };
}

export function buildTranslateMessage(input: LlmTranslateInput): string {
  return TRANSLATE_PROMPT_RAW
    .replace('{{MESSAGE}}', input.message)
    .replace(/\{\{SOURCE_LANG\}\}/g, input.sourceLang)
    .replace(/\{\{TARGET_LANG\}\}/g, input.targetLang)
    .replace('{{INTENT}}', input.intent)
    .replace('{{EMOTION}}', input.emotion);
}

// ── JSON parsing ─────────────────────────────────────────────

const VALID_INTENTS = new Set<PostIntent>(['casual', 'formal', 'question', 'announcement', 'reaction']);
const VALID_EMOTIONS = new Set<PostEmotion>(['neutral', 'happy', 'surprised', 'frustrated', 'excited', 'sad', 'angry']);

export interface TransformJsonResult {
  message: string;
  lang: string;
  intent: PostIntent;
  emotion: PostEmotion;
  tags: string[];
}

export function parseTransformJson(text: string, fallbackLang: string): TransformJsonResult {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const intent = parsed['intent'];
    const emotion = parsed['emotion'];

    return {
      message: typeof parsed['message'] === 'string' ? parsed['message'] : '',
      lang: typeof parsed['lang'] === 'string' ? parsed['lang'] : fallbackLang,
      intent: typeof intent === 'string' && VALID_INTENTS.has(intent as PostIntent)
        ? (intent as PostIntent)
        : 'casual',
      emotion: typeof emotion === 'string' && VALID_EMOTIONS.has(emotion as PostEmotion)
        ? (emotion as PostEmotion)
        : 'neutral',
      tags: Array.isArray(parsed['tags'])
        ? (parsed['tags'] as unknown[]).filter((t): t is string => typeof t === 'string')
        : [],
    };
  } catch {
    return { message: '', lang: fallbackLang, intent: 'casual', emotion: 'neutral', tags: [] };
  }
}

// ── CLI command reconstruction ────────────────────────────────

export function buildCliCommand(result: TransformJsonResult, username: string): string {
  const parts: string[] = [
    `post --user=${username}`,
    `--lang=${result.lang}`,
    `--message="${result.message.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
  ];
  if (result.tags.length > 0) {
    parts.push(`--tags=${result.tags.join(',')}`);
  }
  parts.push(`--intent=${result.intent}`);
  parts.push(`--emotion=${result.emotion}`);
  parts.push('--visibility=public');
  return parts.join(' \\\n  ');
}
