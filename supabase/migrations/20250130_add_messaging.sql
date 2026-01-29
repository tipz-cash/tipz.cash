-- Migration: Add private messaging support
-- Created: 2025-01-30
--
-- This migration adds support for encrypted private messages with tips.
-- Messages are end-to-end encrypted using hybrid RSA+AES encryption.
-- The server only stores the creator's public key and delivery logs (no content).

-- Add public key fields to creators table
-- The public_key is a JWK (JSON Web Key) for RSA-OAEP 4096-bit
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS public_key JSONB,
  ADD COLUMN IF NOT EXISTS key_created_at TIMESTAMPTZ;

-- Add deposit_address to transactions for message correlation
-- This links incoming tips to the deposit address used for the swap
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS deposit_address TEXT;

-- Index for looking up transactions by deposit address
-- Used by the relay endpoint to verify the tip transaction exists
CREATE INDEX IF NOT EXISTS idx_transactions_deposit_address
  ON transactions(deposit_address)
  WHERE deposit_address IS NOT NULL;

-- Message delivery log (metadata only - NO message content)
-- This tracks when messages were delivered for debugging and analytics
-- Privacy: We only log timestamp and destination, never content
CREATE TABLE IF NOT EXISTS message_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to creators table
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,

  -- The deposit address used to correlate with the tip
  deposit_address TEXT NOT NULL,

  -- Delivery timestamp
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT deposit_address_not_empty CHECK (deposit_address <> '')
);

-- Index for looking up deliveries by creator
CREATE INDEX IF NOT EXISTS idx_message_deliveries_creator_id
  ON message_deliveries(creator_id);

-- Index for looking up deliveries by deposit address
CREATE INDEX IF NOT EXISTS idx_message_deliveries_deposit_address
  ON message_deliveries(deposit_address);

-- Enable Row Level Security
ALTER TABLE message_deliveries ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all message deliveries
CREATE POLICY "Service role can manage message deliveries"
  ON message_deliveries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comment on new columns and table for documentation
COMMENT ON COLUMN creators.public_key IS 'RSA-OAEP 4096-bit public key in JWK format for message encryption';
COMMENT ON COLUMN creators.key_created_at IS 'Timestamp when the encryption keypair was generated';
COMMENT ON COLUMN transactions.deposit_address IS 'Deposit address used for the swap, links to encrypted messages';
COMMENT ON TABLE message_deliveries IS 'Delivery log for encrypted messages (metadata only, no content)';
COMMENT ON COLUMN message_deliveries.creator_id IS 'Foreign key to the creator who received the message';
COMMENT ON COLUMN message_deliveries.deposit_address IS 'Deposit address used to correlate with the tip transaction';
COMMENT ON COLUMN message_deliveries.delivered_at IS 'Timestamp when the message was relayed to the creator';
