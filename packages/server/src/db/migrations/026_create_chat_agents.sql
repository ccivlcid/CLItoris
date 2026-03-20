-- Chat agent configurations (external agent endpoints)
CREATE TABLE IF NOT EXISTS chat_agents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  api_key TEXT,
  protocol TEXT NOT NULL DEFAULT 'openai',  -- 'openai' | 'anthropic' | 'custom'
  model TEXT,
  system_prompt TEXT,
  icon TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chat_agents_user ON chat_agents(user_id);
