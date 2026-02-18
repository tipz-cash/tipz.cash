-- Ensure handle_normalized column exists
ALTER TABLE creators ADD COLUMN IF NOT EXISTS handle_normalized TEXT;

-- Backfill handle_normalized for any rows where it is NULL
UPDATE creators
SET handle_normalized = LOWER(REGEXP_REPLACE(handle, '^@', ''))
WHERE handle_normalized IS NULL AND handle IS NOT NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_creators_handle_normalized ON creators(handle_normalized);

-- Ensure public_key and key_created_at columns exist (used by /api/link)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS public_key JSONB;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS key_created_at TIMESTAMPTZ;

-- Confirm stuck pending tips (older than 1 hour) — skip if tipz table doesn't exist yet
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipz') THEN
    UPDATE tipz SET status = 'confirmed'
    WHERE status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';
  END IF;
END $$;
