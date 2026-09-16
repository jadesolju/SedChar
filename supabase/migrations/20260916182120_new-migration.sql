-- Create characters table
CREATE TABLE IF NOT EXISTS public.characters (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    nickname TEXT DEFAULT '',
    tagline TEXT DEFAULT '',
    flag_type TEXT DEFAULT 'none',
    image_url TEXT DEFAULT '',
    gallery_urls JSONB DEFAULT '[]'::jsonb,
    character_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own characters
CREATE POLICY "Users can select their own characters" 
ON public.characters 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own characters
CREATE POLICY "Users can insert their own characters" 
ON public.characters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own characters
CREATE POLICY "Users can update their own characters" 
ON public.characters 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own characters
CREATE POLICY "Users can delete their own characters" 
ON public.characters 
FOR DELETE 
USING (auth.uid() = user_id);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_updated_at ON public.characters(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_characters_flag_type ON public.characters(flag_type);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_characters_updated_at ON public.characters;
CREATE TRIGGER tr_characters_updated_at
    BEFORE UPDATE ON public.characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
