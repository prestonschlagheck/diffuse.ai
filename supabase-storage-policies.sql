-- Storage Policies for the 'recordings' bucket
-- Run this in the Supabase SQL Editor

-- First, ensure the bucket exists and is set up correctly
-- (This may already exist from the dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own recordings" ON storage.objects;

-- Policy: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to read files from their own folder
CREATE POLICY "Users can read their own recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete files from their own folder
CREATE POLICY "Users can delete their own recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Alternative: If you want ALL authenticated users to read ANY recording
-- (useful for shared/public recordings in organizations)
-- Uncomment these if needed:

-- CREATE POLICY "Authenticated users can read all recordings"
-- ON storage.objects
-- FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'recordings');

