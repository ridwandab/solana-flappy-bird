-- Supabase Database Setup for Solana Flappy Bird
-- Run this SQL in your Supabase SQL Editor

-- Create high_scores table
CREATE TABLE IF NOT EXISTS public.high_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_address TEXT NOT NULL,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_cosmetics table
CREATE TABLE IF NOT EXISTS public.user_cosmetics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_address TEXT NOT NULL,
    cosmetic_id TEXT NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_signature TEXT NOT NULL
);

-- Create cosmetics table
CREATE TABLE IF NOT EXISTS public.cosmetics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    rarity TEXT NOT NULL,
    type TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_high_scores_player_address ON public.high_scores(player_address);
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON public.high_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_high_scores_timestamp ON public.high_scores(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_cosmetics_player_address ON public.user_cosmetics(player_address);
CREATE INDEX IF NOT EXISTS idx_cosmetics_is_active ON public.cosmetics(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE public.high_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to high_scores" ON public.high_scores
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to high_scores" ON public.high_scores
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to user_cosmetics" ON public.user_cosmetics
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to user_cosmetics" ON public.user_cosmetics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to cosmetics" ON public.cosmetics
    FOR SELECT USING (true);

-- Insert sample cosmetics data
INSERT INTO public.cosmetics (name, description, price, rarity, type, image_url, is_active) VALUES
('Golden Bird', 'A majestic golden bird with shimmering feathers', 0.1, 'rare', 'bird', '/Bird1.png', true),
('Blue Bird', 'A cool blue bird with electric energy', 0.05, 'common', 'bird', '/Bird3.png', true),
('Red Bird', 'A fiery red bird with burning passion', 0.08, 'uncommon', 'bird', '/Bird4.png', true),
('Purple Bird', 'A mystical purple bird with cosmic powers', 0.12, 'rare', 'bird', '/Bird5.png', true),
('Green Bird', 'A nature-loving green bird with earth energy', 0.06, 'common', 'bird', '/Bird6.png', true),
('Silver Bird', 'A sleek silver bird with metallic shine', 0.15, 'epic', 'bird', '/Bird7.png', true),
('Neon Pipes', 'Bright neon pipes that glow in the dark', 0.2, 'epic', 'pipe', '/Sprite-0004.png', true),
('Crystal Pipes', 'Transparent crystal pipes with rainbow effects', 0.18, 'rare', 'pipe', '/Sprite-0005.png', true),
('Metal Pipes', 'Industrial metal pipes with rust effects', 0.1, 'uncommon', 'pipe', '/Sprite-0006.png', true),
('Wooden Pipes', 'Rustic wooden pipes with natural texture', 0.08, 'common', 'pipe', '/Sprite-0007.png', true)
ON CONFLICT DO NOTHING;

-- Create a view for leaderboard with player names
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    player_name,
    player_address,
    score,
    timestamp,
    ROW_NUMBER() OVER (ORDER BY score DESC, timestamp ASC) as rank
FROM public.high_scores
ORDER BY score DESC, timestamp ASC;

-- Grant access to the view
GRANT SELECT ON public.leaderboard TO anon, authenticated;
