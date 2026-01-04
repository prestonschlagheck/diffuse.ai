-- Add status column to diffuse_recordings table
-- Run this in the Supabase SQL Editor

-- Add the status column with default value 'recorded'
ALTER TABLE diffuse_recordings
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'recorded' CHECK (status IN ('recorded', 'generating', 'transcribed'));

-- Update existing recordings: set status based on whether they have a transcription
UPDATE diffuse_recordings
SET status = CASE 
  WHEN transcription IS NOT NULL AND transcription != '' THEN 'transcribed'
  ELSE 'recorded'
END
WHERE status IS NULL OR status = 'recorded';

