-- ============================================================
-- Run this SQL in your Supabase project:
-- Supabase Dashboard → SQL Editor → New Query → paste & run
-- ============================================================

-- 1. Create the bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create an index so queries by user_id are fast
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);

-- 3. Enable Row Level Security (RLS)
-- This is the DATABASE-LEVEL lock that ensures users can ONLY see their own bookmarks.
-- Without this, any authenticated user could query other users' bookmarks via the API.
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 4. Policy: users can only SELECT their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Policy: users can only INSERT bookmarks for themselves
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Policy: users can only DELETE their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Enable Realtime for the bookmarks table
-- This allows Supabase to push live changes to connected browsers
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
