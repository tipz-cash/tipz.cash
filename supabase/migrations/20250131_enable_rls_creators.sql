-- Migration: Enable Row Level Security on creators table
-- Created: 2025-01-30
--
-- This migration ensures RLS is enabled on the creators table.
-- RLS prevents unauthorized access to creator data.

-- Enable Row Level Security (idempotent - safe to run multiple times)
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all creators
-- (Drop first if exists for idempotency)
DROP POLICY IF EXISTS "Service role can manage creators" ON creators;
CREATE POLICY "Service role can manage creators"
  ON creators
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Public can view verified creators (for tip pages)
DROP POLICY IF EXISTS "Public can view verified creators" ON creators;
CREATE POLICY "Public can view verified creators"
  ON creators
  FOR SELECT
  TO anon
  USING (verification_status = 'verified');

-- Comment for documentation
COMMENT ON POLICY "Service role can manage creators" ON creators IS
  'Service role has full access for API operations';
COMMENT ON POLICY "Public can view verified creators" ON creators IS
  'Anonymous users can view verified creators for tip pages';
