-- ============================================
-- VERIFY CURRENT BUCKET FILE SIZE LIMITS
-- Run this in your Supabase SQL Editor
-- ============================================

SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  ROUND(file_size_limit / 1024.0 / 1024.0, 1) as file_size_limit_mb,
  CASE 
    WHEN file_size_limit >= 524288000 THEN '✅ OK (500MB+)'
    WHEN file_size_limit >= 209715200 THEN '⚠️ 200MB (may be too low)'
    WHEN file_size_limit >= 52428800 THEN '❌ 50MB (too low for 111MB file)'
    ELSE '❌ Very low limit'
  END as status
FROM storage.buckets 
WHERE id IN ('recordings', 'project-files');

-- ============================================
-- If the limits are too low, run this to fix:
-- ============================================

-- Update recordings bucket to 500MB
UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE id = 'recordings';

-- Update project-files bucket to 500MB  
UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE id = 'project-files';

-- Verify again
SELECT 
  id, 
  name, 
  ROUND(file_size_limit / 1024.0 / 1024.0, 1) as file_size_limit_mb
FROM storage.buckets 
WHERE id IN ('recordings', 'project-files');
