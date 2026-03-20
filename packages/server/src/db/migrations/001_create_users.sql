CREATE TABLE IF NOT EXISTS users (
  id                   TEXT PRIMARY KEY,
  username             TEXT UNIQUE NOT NULL,
  domain               TEXT,
  display_name         TEXT NOT NULL DEFAULT '',
  bio                  TEXT DEFAULT '',
  avatar_url           TEXT,
  github_id            TEXT NOT NULL UNIQUE,
  github_username      TEXT NOT NULL,
  github_avatar_url    TEXT,
  github_profile_url   TEXT,
  github_repos_count   INTEGER DEFAULT 0,
  github_connected_at  TEXT NOT NULL DEFAULT (datetime('now')),
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
