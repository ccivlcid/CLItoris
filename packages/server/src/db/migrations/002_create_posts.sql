CREATE TABLE IF NOT EXISTS posts (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_raw     TEXT NOT NULL,
  message_cli     TEXT NOT NULL,
  lang            TEXT NOT NULL DEFAULT 'en',
  tags            TEXT NOT NULL DEFAULT '[]',
  mentions        TEXT NOT NULL DEFAULT '[]',
  visibility      TEXT NOT NULL DEFAULT 'public',
  llm_model       TEXT NOT NULL DEFAULT 'claude-sonnet',
  parent_id       TEXT REFERENCES posts(id) ON DELETE SET NULL,
  forked_from_id  TEXT REFERENCES posts(id) ON DELETE SET NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_llm_model ON posts(llm_model);
CREATE INDEX IF NOT EXISTS idx_posts_parent_id ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
