-- Ensure handle_normalized column exists
ALTER TABLE creators ADD COLUMN IF NOT EXISTS handle_normalized TEXT;

-- Backfill handle_normalized for any rows where it is NULL
UPDATE creators
SET handle_normalized = LOWER(REGEXP_REPLACE(handle, '^@', ''))
WHERE handle_normalized IS NULL AND handle IS NOT NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_creators_handle_normalized ON creators(handle_normalized);

-- Confirm stuck pending tips (older than 1 hour)
UPDATE tipz SET status = 'confirmed'
WHERE status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';
