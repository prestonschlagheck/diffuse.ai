-- ============================================
-- FILE UPLOADS FOR PROJECT INPUTS
-- Run this in your Supabase SQL Editor
-- ============================================
-- 
-- NOTE: Run this script in TWO PARTS if you get enum errors:
--   PART 1: Run lines 1-20 (enum changes) first
--   PART 2: Run the rest after PART 1 commits
--
-- Or just run this entire script - Supabase SQL Editor 
-- usually handles this correctly with separate statements.
-- ============================================

-- ============================================
-- PART 1: ADD NEW INPUT TYPES TO ENUM
-- ============================================
-- These must be committed before use

DO $$ 
BEGIN
  -- Add 'image' type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'image' AND enumtypid = 'input_type'::regtype) THEN
    ALTER TYPE input_type ADD VALUE 'image';
  END IF;
END $$;

DO $$ 
BEGIN
  -- Add 'document' type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'document' AND enumtypid = 'input_type'::regtype) THEN
    ALTER TYPE input_type ADD VALUE 'document';
  END IF;
END $$;

-- ============================================
-- PART 2: CREATE STORAGE BUCKET FOR PROJECT FILES
-- ============================================

-- Create the bucket (50MB file size limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-files', 'project-files', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 3: STORAGE POLICIES FOR PROJECT FILES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload to own project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own project files" ON storage.objects;

-- Users can upload files to their own folder (user_id/...)
CREATE POLICY "Users can upload to own project files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own files
CREATE POLICY "Users can view own project files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users can delete own project files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- VERIFICATION (run separately after above completes)
-- ============================================
-- 
-- To verify the changes worked, run these queries separately:
--
-- Check enum values:
--   SELECT unnest(enum_range(NULL::input_type)) as input_types;
--
-- Check bucket:
--   SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'project-files';
--
-- Check policies:
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%project files%';
