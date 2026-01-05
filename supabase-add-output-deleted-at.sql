-- ============================================
-- ADD SOFT DELETE TO PROJECT OUTPUTS
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add deleted_at column to diffuse_project_outputs
ALTER TABLE diffuse_project_outputs 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for faster queries on non-deleted outputs
CREATE INDEX IF NOT EXISTS idx_project_outputs_deleted_at 
ON diffuse_project_outputs(deleted_at);

-- ============================================
-- DONE! 
-- The outputs table now supports soft delete
-- ============================================

