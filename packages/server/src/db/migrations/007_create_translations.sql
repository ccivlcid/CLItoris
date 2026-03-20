-- Translation cache for tone-aware post translations
-- Populated lazily when post.lang != viewer.ui_lang
-- Uses UNIQUE(post_id, lang) so each (post, target language) pair is cached once
CREATE TABLE IF NOT EXISTS translations (
  id         TEXT PRIMARY KEY,
  post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  lang       TEXT NOT NULL,
  text       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(post_id, lang)
);

CREATE INDEX IF NOT EXISTS idx_translations_post_id ON translations(post_id);
