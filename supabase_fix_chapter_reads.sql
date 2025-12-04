-- Add UPDATE policy for chapter_reads (required for upsert)
CREATE POLICY "Users can update own reads"
ON chapter_reads FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
