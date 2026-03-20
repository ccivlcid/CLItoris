CREATE TABLE IF NOT EXISTS media_attachments (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    TEXT REFERENCES posts(id) ON DELETE CASCADE,
  filename   TEXT NOT NULL,
  mime_type  TEXT NOT NULL,
  file_size  INTEGER NOT NULL,
  width      INTEGER,
  height     INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_media_post_id ON media_attachments(post_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media_attachments(user_id);
