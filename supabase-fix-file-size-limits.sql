-- ============================================
-- FIX FILE SIZE LIMITS FOR LARGE AUDIO UPLOADS
-- Run this in your Supabase SQL Editor
-- ============================================
-- 
-- ⚠️  IMPORTANT: Before running this script, you MUST update the
--     GLOBAL file size limit in your Supabase Dashboard!
-- 
--     Steps:
--     1. Go to Supabase Dashboard → Storage → Settings
--     2. Find "Global file size limit" 
--     3. Set it to at least 200MB (or 500MB for more headroom)
--     4. THEN run this SQL script to update bucket limits
-- 
--     NOTE: Free plan has a 50MB global limit. You may need to
--     upgrade to Pro/Team plan to upload files larger than 50MB.
-- 
-- This script updates both storage buckets to allow
-- uploads up to 500MB (matching the validation limit)
-- 
-- Your 111.3MB file will work after updating BOTH:
--   - Global limit (in Dashboard) 
--   - Bucket limits (this script)
-- ============================================

-- Update recordings bucket to 500MB (524288000 bytes)
UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE id = 'recordings';

-- Update project-files bucket to 500MB (524288000 bytes)
UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE id = 'project-files';

-- Verify the changes
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  ROUND(file_size_limit / 1024.0 / 1024.0, 1) as file_size_limit_mb
FROM storage.buckets 
WHERE id IN ('recordings', 'project-files');

-- ============================================
-- Expected output:
-- recordings | recordings | false | 524288000 | 500.0
-- project-files | project-files | false | 524288000 | 500.0
-- ============================================
