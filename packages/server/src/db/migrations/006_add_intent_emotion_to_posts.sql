-- Add intent and emotion metadata columns to posts
-- Populated by the LLM metadata extraction prompt (transform.md)
ALTER TABLE posts ADD COLUMN intent TEXT NOT NULL DEFAULT 'neutral';
ALTER TABLE posts ADD COLUMN emotion TEXT NOT NULL DEFAULT 'neutral';
