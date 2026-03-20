-- User-provided LLM API keys
-- Keys are entered by users in settings, not stored in .env
CREATE TABLE IF NOT EXISTS user_llm_keys (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL,
  api_key     TEXT NOT NULL,
  label       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_llm_keys_user_id ON user_llm_keys(user_id);
