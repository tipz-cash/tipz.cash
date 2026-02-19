-- Drop transactions table.
-- This table was created in the initial migration but was superseded by the
-- tipz table (20250211_create_tipz_table.sql) and is no longer referenced
-- anywhere in the application code.

DROP TABLE IF EXISTS transactions;
