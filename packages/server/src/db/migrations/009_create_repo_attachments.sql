-- Repo attachments: GitHub repo info cached per post
-- Populated when a user attaches a repo to a post (--repo=owner/name)
CREATE TABLE IF NOT EXISTS repo_attachments (
  post_id       TEXT PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  repo_owner    TEXT NOT NULL,
  repo_name     TEXT NOT NULL,
  repo_stars    INTEGER NOT NULL DEFAULT 0,
  repo_forks    INTEGER NOT NULL DEFAULT 0,
  repo_language TEXT,
  cached_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_repo_attachments_repo ON repo_attachments(repo_owner, repo_name);
