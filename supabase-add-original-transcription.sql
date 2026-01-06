-- Add original_transcription column to diffuse_recordings
-- This stores the original AI-generated transcription so we can show diffs after user edits

ALTER TABLE diffuse_recordings
ADD COLUMN IF NOT EXISTS original_transcription TEXT DEFAULT NULL;

-- Backfill existing transcriptions: set original_transcription = transcription for all existing records
UPDATE diffuse_recordings 
SET original_transcription = transcription 
WHERE transcription IS NOT NULL AND original_transcription IS NULL;

