-- Migration: Create transactions table for TIPZ tip logging
-- Created: 2025-01-22
--
-- This table stores all tip transactions processed through TIPZ.
-- It tracks the full lifecycle from pending -> confirmed/failed.

-- Create enum type for transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed');

-- Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to creators table (nullable for anonymous tips)
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,

  -- Transaction parties
  sender_address TEXT,                          -- Sender's shielded address (optional, for anonymous tips)
  recipient_address TEXT NOT NULL,              -- Creator's shielded address

  -- Transaction amounts
  amount_zec DECIMAL(18, 8) NOT NULL,           -- Amount in ZEC (8 decimal places)
  amount_usd DECIMAL(10, 2),                    -- USD value at time of transaction

  -- Blockchain details
  tx_hash TEXT UNIQUE,                          -- Zcash transaction hash (64 hex chars)
  status transaction_status NOT NULL DEFAULT 'pending',
  confirmations INTEGER DEFAULT 0,              -- Number of blockchain confirmations

  -- Transaction metadata
  memo TEXT,                                    -- Encrypted memo field (up to 512 bytes in Zcash)
  source_platform TEXT NOT NULL,                -- Origin: x, substack, extension, api, web
  source_url TEXT,                              -- URL where tip was initiated

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,                     -- When confirmed on blockchain

  -- Flexible metadata storage
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT amount_zec_positive CHECK (amount_zec > 0),
  CONSTRAINT valid_source_platform CHECK (source_platform IN ('x', 'substack', 'extension', 'api', 'web'))
);

-- Indexes for common query patterns
CREATE INDEX idx_transactions_creator_id ON transactions(creator_id);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash) WHERE tx_hash IS NOT NULL;
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_source_platform ON transactions(source_platform);

-- Composite index for creator dashboard queries
CREATE INDEX idx_transactions_creator_status ON transactions(creator_id, status);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all transactions
CREATE POLICY "Service role can manage transactions"
  ON transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can view their own transactions (as creator)
-- Note: This requires joining with creators table on auth.uid()
-- For now, we'll use service role for all operations

-- Policy: Public can view aggregate stats (no PII exposed)
-- This allows the extension to verify transactions without authentication

-- Comment on table and columns for documentation
COMMENT ON TABLE transactions IS 'Tip transactions processed through TIPZ platform';
COMMENT ON COLUMN transactions.creator_id IS 'Foreign key to creators table, null for anonymous tips';
COMMENT ON COLUMN transactions.sender_address IS 'Sender shielded address, null for truly anonymous tips';
COMMENT ON COLUMN transactions.recipient_address IS 'Recipient (creator) shielded address';
COMMENT ON COLUMN transactions.amount_zec IS 'Tip amount in ZEC with 8 decimal precision';
COMMENT ON COLUMN transactions.amount_usd IS 'USD value at transaction time for analytics';
COMMENT ON COLUMN transactions.tx_hash IS 'Zcash blockchain transaction hash';
COMMENT ON COLUMN transactions.status IS 'Transaction lifecycle: pending -> confirmed/failed';
COMMENT ON COLUMN transactions.confirmations IS 'Number of blockchain confirmations';
COMMENT ON COLUMN transactions.memo IS 'Encrypted memo field from Zcash transaction';
COMMENT ON COLUMN transactions.source_platform IS 'Where the tip was initiated from';
COMMENT ON COLUMN transactions.source_url IS 'URL of content being tipped';
COMMENT ON COLUMN transactions.metadata IS 'Flexible JSONB field for additional data';
