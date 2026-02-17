-- Add plaintext amount columns to tipz table.
-- Amounts are not sensitive (server knows them at write time, logged to console,
-- known to NEAR Intents). Only memos need E2E encryption.
-- Nullable so existing rows without amounts remain null until backfilled.

ALTER TABLE tipz ADD COLUMN amount_zec DECIMAL(18, 8);
ALTER TABLE tipz ADD COLUMN amount_usd DECIMAL(10, 2);
