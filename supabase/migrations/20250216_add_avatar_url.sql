-- Migration: Add avatar_url to creators table
-- Created: 2025-02-16
--
-- Stores the creator's X/Twitter profile image URL.
-- Populated during registration via Twitter API lookup.

ALTER TABLE creators ADD COLUMN IF NOT EXISTS avatar_url TEXT;
COMMENT ON COLUMN creators.avatar_url IS 'Profile image URL from X/Twitter';
