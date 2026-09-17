-- Migration: Add sharing columns and update RLS policies
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS flag_type TEXT DEFAULT 'none';
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS character_data JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS share_id TEXT;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS share_permission TEXT DEFAULT 'read-only';
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters (user_id);
CREATE INDEX IF NOT EXISTS idx_characters_share_id ON public.characters (share_id);

-- Enable RLS
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Reset policies
DROP POLICY IF EXISTS "Allow select for owner or shared" ON public.characters;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.characters;
DROP POLICY IF EXISTS "Allow update for owner" ON public.characters;
DROP POLICY IF EXISTS "Allow delete for owner" ON public.characters;
DROP POLICY IF EXISTS "Users can select their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can insert their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can update their own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can delete their own characters" ON public.characters;

-- Policies
CREATE POLICY "Allow select for owner or shared"
ON public.characters FOR SELECT
USING (
    auth.uid() = user_id 
    OR is_shared = true
);

CREATE POLICY "Allow insert for authenticated users"
ON public.characters FOR INSERT
WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Allow update for owner"
ON public.characters FOR UPDATE
USING (
    auth.uid() = user_id
);

CREATE POLICY "Allow delete for owner"
ON public.characters FOR DELETE
USING (
    auth.uid() = user_id
);
