-- Remove plaintext amount columns from tipz table.
-- Amounts now live exclusively inside the encrypted `data` blob.
-- This restores the single-blob privacy model.

ALTER TABLE tipz DROP COLUMN IF EXISTS amount_zec;
ALTER TABLE tipz DROP COLUMN IF EXISTS amount_usd;
