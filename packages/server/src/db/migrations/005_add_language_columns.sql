-- Add UI language and default post language preferences to users
ALTER TABLE users ADD COLUMN ui_lang TEXT NOT NULL DEFAULT 'en';
ALTER TABLE users ADD COLUMN default_post_lang TEXT NOT NULL DEFAULT 'auto';
