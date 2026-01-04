-- ============================================
-- DIFFUSE.AI - Fix Project Visibility RLS
-- ============================================
-- Updates project policies to properly check visible_to_orgs array
-- 
-- Visibility logic:
-- - Private: Only creator can see
-- - Public: Only users in the selected organizations can see
-- ============================================

-- Drop existing project policies
DROP POLICY IF EXISTS "projects_select" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_insert" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_update" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_delete" ON diffuse_projects;

-- Also drop input/output policies that reference projects
DROP POLICY IF EXISTS "inputs_select" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "outputs_select" ON diffuse_project_outputs;

-- ============================================
-- PROJECTS - Fixed visibility logic
-- ============================================

-- Users can see:
-- 1. Their own projects (any visibility)
-- 2. Public projects where one of their workspace IDs is in visible_to_orgs
CREATE POLICY "projects_select" ON diffuse_projects
FOR SELECT USING (
  created_by = auth.uid()
  OR (
    visibility = 'public'
    AND visible_to_orgs && ARRAY(SELECT get_my_workspace_ids())::text[]
  )
);

-- Users can create their own projects
CREATE POLICY "projects_insert" ON diffuse_projects
FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update their own projects
CREATE POLICY "projects_update" ON diffuse_projects
FOR UPDATE USING (created_by = auth.uid());

-- Users can delete their own projects
CREATE POLICY "projects_delete" ON diffuse_projects
FOR DELETE USING (created_by = auth.uid());

-- ============================================
-- PROJECT INPUTS - Fixed to match project visibility
-- ============================================

CREATE POLICY "inputs_select" ON diffuse_project_inputs
FOR SELECT USING (
  created_by = auth.uid()
  OR project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
  OR project_id IN (
    SELECT id FROM diffuse_projects 
    WHERE visibility = 'public' 
    AND visible_to_orgs && ARRAY(SELECT get_my_workspace_ids())::text[]
  )
);

-- ============================================
-- PROJECT OUTPUTS - Fixed to match project visibility
-- ============================================

CREATE POLICY "outputs_select" ON diffuse_project_outputs
FOR SELECT USING (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
  OR project_id IN (
    SELECT id FROM diffuse_projects 
    WHERE visibility = 'public' 
    AND visible_to_orgs && ARRAY(SELECT get_my_workspace_ids())::text[]
  )
);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('diffuse_projects', 'diffuse_project_inputs', 'diffuse_project_outputs')
ORDER BY tablename, policyname;

