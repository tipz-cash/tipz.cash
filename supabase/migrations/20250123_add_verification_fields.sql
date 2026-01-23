-- Migration: Add tweet verification fields to creators table
-- Created: 2025-01-23
--
-- This migration adds fields to track Twitter/X tweet verification status.
-- Verification proves the user controls the X handle they're registering.

-- Create enum type for verification status
CREATE TYPE verification_status AS ENUM (
  'pending',       -- Tweet URL provided but not yet verified via API
  'verified',      -- Tweet content verified successfully
  'failed',        -- Verification attempted but failed
  'manual_review'  -- Flagged for manual review (edge cases)
);

-- Add verification fields to creators table
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS tweet_id TEXT,
  ADD COLUMN IF NOT EXISTS twitter_user_id TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Index for filtering by verification status (e.g., showing only verified creators)
CREATE INDEX IF NOT EXISTS idx_creators_verification_status
  ON creators(verification_status);

-- Index for looking up by tweet_id (for re-verification checks)
CREATE INDEX IF NOT EXISTS idx_creators_tweet_id
  ON creators(tweet_id)
  WHERE tweet_id IS NOT NULL;

-- Index for looking up by twitter_user_id (for account consistency checks)
CREATE INDEX IF NOT EXISTS idx_creators_twitter_user_id
  ON creators(twitter_user_id)
  WHERE twitter_user_id IS NOT NULL;

-- Comment on new columns for documentation
COMMENT ON COLUMN creators.verification_status IS 'Tweet verification state: pending, verified, failed, manual_review';
COMMENT ON COLUMN creators.tweet_id IS 'Twitter/X tweet ID used for verification';
COMMENT ON COLUMN creators.twitter_user_id IS 'Twitter/X user ID (numeric) for the verified account';
COMMENT ON COLUMN creators.verified_at IS 'Timestamp when tweet verification was completed';
