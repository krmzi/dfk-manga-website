-- Create chapter_reads table to track which chapters users have read
CREATE TABLE IF NOT EXISTS chapter_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    manga_id UUID NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chapter_reads_user ON chapter_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_reads_chapter ON chapter_reads(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_reads_manga_user ON chapter_reads(manga_id, user_id);

-- Enable Row Level Security
ALTER TABLE chapter_reads ENABLE ROW LEVEL SECURITY;

-- Users can view their own read history
CREATE POLICY "Users can view own reads"
ON chapter_reads FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own reads
CREATE POLICY "Users can insert own reads"
ON chapter_reads FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reads (if they want to mark as unread)
CREATE POLICY "Users can delete own reads"
ON chapter_reads FOR DELETE
USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE chapter_reads IS 'Tracks which chapters each user has read';
