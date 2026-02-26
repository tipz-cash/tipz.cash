-- tweet_url is no longer used — OAuth login replaced tweet verification
ALTER TABLE creators ALTER COLUMN tweet_url DROP NOT NULL;
ALTER TABLE creators ALTER COLUMN tweet_url SET DEFAULT NULL;

-- tweet_id and twitter_user_id were never populated under OAuth flow
DROP INDEX IF EXISTS idx_creators_tweet_id;
DROP INDEX IF EXISTS idx_creators_twitter_user_id;
ALTER TABLE creators DROP COLUMN IF EXISTS tweet_id;
ALTER TABLE creators DROP COLUMN IF EXISTS twitter_user_id;
ALTER TABLE creators DROP COLUMN IF EXISTS tweet_url;
