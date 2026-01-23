-- ============================================
-- DIFFUSE.AI - Allow Admins to Delete Workspaces
-- ============================================
-- Updates RLS policy to allow admins (in addition to owners) to delete workspaces
-- 
-- Security: Only admins and owners can delete workspaces
-- When a workspace is deleted:
-- - All workspace members are automatically removed (CASCADE)
-- - Projects with workspace_id are set to NULL (converted to personal projects)
-- ============================================

-- Drop existing delete policy
DROP POLICY IF EXISTS "workspaces_delete" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Owners can delete workspaces" ON diffuse_workspaces;

-- Create new policy that allows both owners and admins to delete
CREATE POLICY "workspaces_delete" ON diffuse_workspaces
FOR DELETE USING (
  -- Owners can always delete
  owner_id = auth.uid()
  OR
  -- Admins can also delete
  id IN (
    SELECT workspace_id 
    FROM diffuse_workspace_members 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================
-- OPTIONAL: Update Foreign Key Constraint
-- ============================================
-- If you want projects to automatically become personal projects (workspace_id = NULL)
-- when a workspace is deleted, instead of being deleted, run this:
-- 
-- Note: This changes the behavior from CASCADE DELETE to SET NULL
-- Only run this if you want projects to be preserved when workspace is deleted
-- 
-- ALTER TABLE diffuse_projects
-- DROP CONSTRAINT IF EXISTS diffuse_projects_workspace_id_fkey;
-- 
-- ALTER TABLE diffuse_projects
-- ADD CONSTRAINT diffuse_projects_workspace_id_fkey
-- FOREIGN KEY (workspace_id)
-- REFERENCES diffuse_workspaces(id)
-- ON DELETE SET NULL;
-- 
-- ============================================
-- VERIFICATION
-- ============================================
-- Check the policy was created correctly:
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'diffuse_workspaces' 
-- AND policyname = 'workspaces_delete';
-- ============================================
