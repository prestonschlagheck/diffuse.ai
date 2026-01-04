-- Database updates for Diffuse.ai UI changes
-- Run this in your Supabase SQL Editor

-- Add deleted_at column to diffuse_project_inputs for soft delete/trash functionality
ALTER TABLE diffuse_project_inputs
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create an index for faster queries on non-deleted inputs
CREATE INDEX IF NOT EXISTS idx_project_inputs_deleted_at 
ON diffuse_project_inputs(project_id, deleted_at);

-- Add metadata column if it doesn't exist (stores source info like 'recording' vs 'manual')
ALTER TABLE diffuse_project_inputs
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

-- Update RLS policies to work with the new deleted_at column
-- Users can update their own inputs (for soft delete)
DROP POLICY IF EXISTS "Users can update their own inputs" ON diffuse_project_inputs;
CREATE POLICY "Users can update their own inputs"
ON diffuse_project_inputs
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Verify the schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'diffuse_project_inputs'
ORDER BY ordinal_position;

