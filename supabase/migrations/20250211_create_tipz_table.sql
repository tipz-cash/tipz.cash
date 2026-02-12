CREATE TABLE IF NOT EXISTS tipz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  source_platform TEXT NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  data TEXT,

  CONSTRAINT valid_tipz_source_platform CHECK (source_platform IN ('x', 'substack', 'extension', 'api', 'web'))
);

CREATE INDEX idx_tipz_creator_id ON tipz(creator_id);
CREATE INDEX idx_tipz_status ON tipz(status);
CREATE INDEX idx_tipz_created_at ON tipz(created_at DESC);

ALTER TABLE tipz ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage tipz"
  ON tipz
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
