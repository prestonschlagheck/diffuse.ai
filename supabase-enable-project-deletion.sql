-- ============================================
-- ENABLE PROJECT DELETION
-- This ensures users can delete their own projects and related data
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can delete own project inputs" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "Users can delete own project outputs" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "Users can delete own projects" ON diffuse_projects;

-- Allow users to delete their own project inputs
CREATE POLICY "Users can delete own project inputs"
ON diffuse_project_inputs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM diffuse_projects 
    WHERE diffuse_projects.id = diffuse_project_inputs.project_id 
    AND diffuse_projects.created_by = auth.uid()
  )
);

-- Allow users to delete their own project outputs  
CREATE POLICY "Users can delete own project outputs"
ON diffuse_project_outputs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM diffuse_projects 
    WHERE diffuse_projects.id = diffuse_project_outputs.project_id 
    AND diffuse_projects.created_by = auth.uid()
  )
);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete own projects"
ON diffuse_projects FOR DELETE
USING (created_by = auth.uid());
