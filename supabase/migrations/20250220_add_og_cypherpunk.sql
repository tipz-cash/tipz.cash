-- Add OG Cypherpunk badge columns
ALTER TABLE creators ADD COLUMN is_og_cypherpunk BOOLEAN DEFAULT false;
ALTER TABLE creators ADD COLUMN og_number INTEGER;

-- Backfill: existing verified creators get OG status, numbered by registration order
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM creators
  WHERE verification_status = 'verified'
)
UPDATE creators
SET is_og_cypherpunk = true,
    og_number = numbered.rn
FROM numbered
WHERE creators.id = numbered.id
  AND numbered.rn <= 100;

-- Index for fast count queries during registration
CREATE INDEX idx_creators_og_cypherpunk ON creators (is_og_cypherpunk) WHERE is_og_cypherpunk = true;

-- Unique constraint on og_number to prevent race conditions
CREATE UNIQUE INDEX idx_creators_og_number ON creators (og_number) WHERE og_number IS NOT NULL;
