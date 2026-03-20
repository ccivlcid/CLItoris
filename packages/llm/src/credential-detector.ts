import { execSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import type { DetectedProvider } from './types.js';

/** Well-known CLI binary locations (synced with agentoffice pattern). */
const CLI_PATH_FALLBACK_DIRS: string[] = process.platform === 'win32'
  ? [
      path.join(os.homedir(), '.local', 'bin'),
      path.join(process.env['ProgramFiles'] ?? 'C:\\Program Files', 'nodejs'),
      path.join(process.env['LOCALAPPDATA'] ?? '', 'Programs', 'nodejs'),
      path.join(process.env['APPDATA'] ?? '', 'npm'),
    ].filter(Boolean)
  : [
      '/opt/homebrew/bin',
      '/usr/local/bin',
      '/usr/bin',
      '/bin',
      path.join(os.homedir(), '.local', 'bin'),
      path.join(os.homedir(), 'bin'),
    ];

function augmentedPath(): string {
  const parts = (process.env['PATH'] ?? '')
    .split(path.delimiter)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set(parts);
  // Also try npm global prefix
  try {
    const prefix = execSync('npm prefix -g', { encoding: 'utf8', timeout: 5000 }).trim();
    if (prefix) {
      const binDir = process.platform === 'win32' ? prefix : path.join(prefix, 'bin');
      if (!seen.has(binDir)) { parts.push(binDir); seen.add(binDir); }
    }
  } catch { /* ignore */ }
  for (const dir of CLI_PATH_FALLBACK_DIRS) {
    if (dir && !seen.has(dir)) { parts.push(dir); seen.add(dir); }
  }
  return parts.join(path.delimiter);
}

/**
 * Detects locally available LLM runtimes (Ollama, CLI tools).
 * Does NOT check environment variables — API keys are user-provided via settings.
 */
export function detectLocalRuntimes(): DetectedProvider[] {
  const results: DetectedProvider[] = [];
  const env = { ...process.env, PATH: augmentedPath() };

  // Ollama — check if running on localhost
  try {
    const res = execSync('curl -sf http://localhost:11434/api/tags', { stdio: 'pipe', timeout: 2000, env });
    if (res) {
      results.push({ provider: 'ollama', source: 'localhost:11434', isAvailable: true });
    }
  } catch {
    // Ollama not running
  }

  // CLI tools in PATH
  const whichCmd = process.platform === 'win32' ? 'where' : 'which';
  const cliTools = ['claude', 'codex', 'opencode'] as const;
  for (const tool of cliTools) {
    try {
      execSync(`${whichCmd} ${tool}`, { stdio: 'ignore', env });
      results.push({ provider: `cli:${tool}`, source: `path:${tool}`, isAvailable: true });
    } catch {
      // binary not found
    }
  }

  return results;
}
