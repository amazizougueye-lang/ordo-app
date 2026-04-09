-- Migration: Google Calendar Sync
-- Run this in Supabase SQL Editor

-- 1. Table to store Google OAuth tokens per user
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  google_email TEXT,
  calendar_sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS policies
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens"
  ON google_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
  ON google_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
  ON google_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens"
  ON google_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Add google_event_id to cases and case_deadlines
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS google_event_id TEXT;

ALTER TABLE case_deadlines
  ADD COLUMN IF NOT EXISTS google_event_id TEXT;
