CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  output_type TEXT NOT NULL DEFAULT 'report',
  llm_model TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  options_json TEXT NOT NULL DEFAULT '{}',
  result_url TEXT,
  result_summary TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  progress_json TEXT NOT NULL DEFAULT '[]',
  duration_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
