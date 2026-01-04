-- ============================================
-- DIFFUSE.AI - Row Level Security Policies
-- ============================================
-- This file contains all RLS policies for the application.
-- Run this in Supabase SQL Editor to set up or reset policies.
-- 
-- SECURITY DEFINER functions are used to avoid circular RLS dependencies.
-- This is the recommended Supabase pattern and is secure because:
--   1. Functions only return boolean values, not data
--   2. Functions are STABLE (read-only, no side effects)
--   3. RLS policies still control what data is actually returned
-- ============================================

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Check if a user is a member of a workspace
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM diffuse_workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = user_uuid
  );
$$;

-- Check if a user is an admin of a workspace
CREATE OR REPLACE FUNCTION is_workspace_admin(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM diffuse_workspace_members
    WHERE workspace_id = workspace_uuid
    AND user_id = user_uuid
    AND role = 'admin'
  );
$$;

-- Check if two users share any workspace
CREATE OR REPLACE FUNCTION users_share_workspace(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM diffuse_workspace_members m1
    JOIN diffuse_workspace_members m2 ON m1.workspace_id = m2.workspace_id
    WHERE m1.user_id = user1_uuid AND m2.user_id = user2_uuid
  );
$$;

-- ============================================
-- USER PROFILES
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "profiles_update" ON user_profiles;

-- Users can view their own profile and profiles of people in shared orgs
CREATE POLICY "profiles_select" ON user_profiles
FOR SELECT USING (
  id = auth.uid()
  OR users_share_workspace(auth.uid(), id)
);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert" ON user_profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "profiles_update" ON user_profiles
FOR UPDATE USING (id = auth.uid());

-- ============================================
-- WORKSPACES (Organizations)
-- ============================================
ALTER TABLE diffuse_workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_select" ON diffuse_workspaces;
DROP POLICY IF EXISTS "workspace_insert" ON diffuse_workspaces;
DROP POLICY IF EXISTS "workspace_update" ON diffuse_workspaces;
DROP POLICY IF EXISTS "workspace_delete" ON diffuse_workspaces;

-- Users can view workspaces they own, are members of, or that have invite codes (for joining)
CREATE POLICY "workspace_select" ON diffuse_workspaces
FOR SELECT USING (
  owner_id = auth.uid()
  OR is_workspace_member(id, auth.uid())
  OR invite_code IS NOT NULL
);

-- Users can create workspaces (they become owner)
CREATE POLICY "workspace_insert" ON diffuse_workspaces
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Only admins can update workspace details
CREATE POLICY "workspace_update" ON diffuse_workspaces
FOR UPDATE USING (
  owner_id = auth.uid()
  OR is_workspace_admin(id, auth.uid())
);

-- Only owner can delete workspace
CREATE POLICY "workspace_delete" ON diffuse_workspaces
FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- WORKSPACE MEMBERS
-- ============================================
ALTER TABLE diffuse_workspace_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_members_select" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON diffuse_workspace_members;

-- Users can see their own memberships and memberships in orgs they belong to
CREATE POLICY "workspace_members_select" ON diffuse_workspace_members
FOR SELECT USING (
  user_id = auth.uid()
  OR is_workspace_member(workspace_id, auth.uid())
);

-- Users can join orgs (insert themselves as member)
CREATE POLICY "workspace_members_insert" ON diffuse_workspace_members
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can update member roles
CREATE POLICY "workspace_members_update" ON diffuse_workspace_members
FOR UPDATE USING (is_workspace_admin(workspace_id, auth.uid()));

-- Users can leave orgs, admins can remove members
CREATE POLICY "workspace_members_delete" ON diffuse_workspace_members
FOR DELETE USING (
  user_id = auth.uid()
  OR is_workspace_admin(workspace_id, auth.uid())
);

-- ============================================
-- PROJECTS
-- ============================================
ALTER TABLE diffuse_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_insert" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_update" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_delete" ON diffuse_projects;

-- Users can see their own projects and public projects from org members
CREATE POLICY "projects_select" ON diffuse_projects
FOR SELECT USING (
  created_by = auth.uid()
  OR (
    visibility = 'public'
    AND users_share_workspace(auth.uid(), created_by)
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
-- PROJECT INPUTS
-- ============================================
ALTER TABLE diffuse_project_inputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inputs_select" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "inputs_insert" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "inputs_update" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "inputs_delete" ON diffuse_project_inputs;

-- Users can see inputs for projects they can access
CREATE POLICY "inputs_select" ON diffuse_project_inputs
FOR SELECT USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM diffuse_projects 
    WHERE diffuse_projects.id = project_id 
    AND (
      diffuse_projects.created_by = auth.uid()
      OR (diffuse_projects.visibility = 'public' AND users_share_workspace(auth.uid(), diffuse_projects.created_by))
    )
  )
);

-- Users can create inputs for their own projects
CREATE POLICY "inputs_insert" ON diffuse_project_inputs
FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update their own inputs
CREATE POLICY "inputs_update" ON diffuse_project_inputs
FOR UPDATE USING (created_by = auth.uid());

-- Users can delete their own inputs
CREATE POLICY "inputs_delete" ON diffuse_project_inputs
FOR DELETE USING (created_by = auth.uid());

-- ============================================
-- PROJECT OUTPUTS
-- ============================================
ALTER TABLE diffuse_project_outputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "outputs_select" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "outputs_insert" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "outputs_update" ON diffuse_project_outputs;

-- Users can see outputs for projects they can access
CREATE POLICY "outputs_select" ON diffuse_project_outputs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM diffuse_projects 
    WHERE diffuse_projects.id = project_id 
    AND (
      diffuse_projects.created_by = auth.uid()
      OR (diffuse_projects.visibility = 'public' AND users_share_workspace(auth.uid(), diffuse_projects.created_by))
    )
  )
);

-- System/users can create outputs
CREATE POLICY "outputs_insert" ON diffuse_project_outputs
FOR INSERT WITH CHECK (true);

-- Users can update outputs on their projects
CREATE POLICY "outputs_update" ON diffuse_project_outputs
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM diffuse_projects 
    WHERE diffuse_projects.id = project_id 
    AND diffuse_projects.created_by = auth.uid()
  )
);

-- ============================================
-- RECORDINGS
-- ============================================
ALTER TABLE diffuse_recordings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recordings_select" ON diffuse_recordings;
DROP POLICY IF EXISTS "recordings_insert" ON diffuse_recordings;
DROP POLICY IF EXISTS "recordings_update" ON diffuse_recordings;
DROP POLICY IF EXISTS "recordings_delete" ON diffuse_recordings;

-- Users can only see their own recordings
CREATE POLICY "recordings_select" ON diffuse_recordings
FOR SELECT USING (user_id = auth.uid());

-- Users can create their own recordings
CREATE POLICY "recordings_insert" ON diffuse_recordings
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own recordings
CREATE POLICY "recordings_update" ON diffuse_recordings
FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own recordings
CREATE POLICY "recordings_delete" ON diffuse_recordings
FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify all policies are in place:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

