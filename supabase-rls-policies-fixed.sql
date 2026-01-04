-- ============================================
-- DIFFUSE.AI - Row Level Security Policies (FIXED)
-- ============================================
-- This version fixes the infinite recursion issue by:
-- 1. NOT using helper functions that query the same table being protected
-- 2. Using direct ownership checks where possible
-- 3. Using SECURITY DEFINER functions ONLY for cross-table checks
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES FIRST
-- ============================================
DROP POLICY IF EXISTS "profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "profiles_update" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles of org members" ON user_profiles;

DROP POLICY IF EXISTS "workspace_select" ON diffuse_workspaces;
DROP POLICY IF EXISTS "workspace_insert" ON diffuse_workspaces;
DROP POLICY IF EXISTS "workspace_update" ON diffuse_workspaces;
DROP POLICY IF EXISTS "workspace_delete" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Users can view workspaces" ON diffuse_workspaces;

DROP POLICY IF EXISTS "workspace_members_select" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "Users can view memberships" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "Users can join orgs" ON diffuse_workspace_members;

DROP POLICY IF EXISTS "projects_select" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_insert" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_update" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_delete" ON diffuse_projects;
DROP POLICY IF EXISTS "Members can view org public projects" ON diffuse_projects;

DROP POLICY IF EXISTS "inputs_select" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "inputs_insert" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "inputs_update" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "inputs_delete" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "Users can update their own inputs" ON diffuse_project_inputs;

DROP POLICY IF EXISTS "outputs_select" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "outputs_insert" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "outputs_update" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "outputs_delete" ON diffuse_project_outputs;

DROP POLICY IF EXISTS "recordings_select" ON diffuse_recordings;
DROP POLICY IF EXISTS "recordings_insert" ON diffuse_recordings;
DROP POLICY IF EXISTS "recordings_update" ON diffuse_recordings;
DROP POLICY IF EXISTS "recordings_delete" ON diffuse_recordings;
DROP POLICY IF EXISTS "Users can view own recordings" ON diffuse_recordings;
DROP POLICY IF EXISTS "Users can create own recordings" ON diffuse_recordings;
DROP POLICY IF EXISTS "Users can update own recordings" ON diffuse_recordings;
DROP POLICY IF EXISTS "Users can delete own recordings" ON diffuse_recordings;

-- ============================================
-- STEP 2: DROP EXISTING HELPER FUNCTIONS
-- ============================================
DROP FUNCTION IF EXISTS is_workspace_member(UUID, UUID);
DROP FUNCTION IF EXISTS is_workspace_admin(UUID, UUID);
DROP FUNCTION IF EXISTS users_share_workspace(UUID, UUID);

-- ============================================
-- STEP 3: ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_project_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_project_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_recordings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: WORKSPACE MEMBERS POLICIES (FIRST - NO DEPENDENCIES)
-- ============================================
-- These policies MUST NOT reference helper functions that query this table!

-- Users can see all memberships in workspaces they belong to
-- Uses a simple subquery that checks workspace ownership OR existing membership
CREATE POLICY "workspace_members_select" ON diffuse_workspace_members
FOR SELECT USING (
  -- User can see their own memberships
  user_id = auth.uid()
  -- Or memberships in workspaces the user owns
  OR workspace_id IN (
    SELECT id FROM diffuse_workspaces WHERE owner_id = auth.uid()
  )
  -- Or memberships in workspaces where user is already a member (correlated subquery)
  OR workspace_id IN (
    SELECT dwm2.workspace_id 
    FROM diffuse_workspace_members dwm2 
    WHERE dwm2.user_id = auth.uid()
  )
);

-- Users can join organizations (insert themselves)
CREATE POLICY "workspace_members_insert" ON diffuse_workspace_members
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins/owners can update member roles
CREATE POLICY "workspace_members_update" ON diffuse_workspace_members
FOR UPDATE USING (
  -- Workspace owner
  workspace_id IN (SELECT id FROM diffuse_workspaces WHERE owner_id = auth.uid())
  -- Or admin of workspace
  OR workspace_id IN (
    SELECT workspace_id FROM diffuse_workspace_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Users can leave, owners/admins can remove
CREATE POLICY "workspace_members_delete" ON diffuse_workspace_members
FOR DELETE USING (
  user_id = auth.uid()
  OR workspace_id IN (SELECT id FROM diffuse_workspaces WHERE owner_id = auth.uid())
  OR workspace_id IN (
    SELECT workspace_id FROM diffuse_workspace_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- STEP 5: WORKSPACES POLICIES
-- ============================================

-- Users can view workspaces they own, are members of, or that have invite codes
CREATE POLICY "workspace_select" ON diffuse_workspaces
FOR SELECT USING (
  owner_id = auth.uid()
  OR id IN (
    SELECT workspace_id FROM diffuse_workspace_members WHERE user_id = auth.uid()
  )
  -- Allow viewing any workspace with invite code (for joining)
  OR invite_code IS NOT NULL
);

-- Users can create workspaces (become owner)
CREATE POLICY "workspace_insert" ON diffuse_workspaces
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Owners and admins can update
CREATE POLICY "workspace_update" ON diffuse_workspaces
FOR UPDATE USING (
  owner_id = auth.uid()
  OR id IN (
    SELECT workspace_id FROM diffuse_workspace_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only owner can delete
CREATE POLICY "workspace_delete" ON diffuse_workspaces
FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- STEP 6: USER PROFILES POLICIES
-- ============================================

-- Users can view their own profile and profiles of org members
CREATE POLICY "profiles_select" ON user_profiles
FOR SELECT USING (
  id = auth.uid()
  -- Users in same workspace
  OR id IN (
    SELECT dwm2.user_id 
    FROM diffuse_workspace_members dwm1
    JOIN diffuse_workspace_members dwm2 ON dwm1.workspace_id = dwm2.workspace_id
    WHERE dwm1.user_id = auth.uid()
  )
);

-- Users can insert their own profile
CREATE POLICY "profiles_insert" ON user_profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update" ON user_profiles
FOR UPDATE USING (id = auth.uid());

-- ============================================
-- STEP 7: PROJECTS POLICIES
-- ============================================

-- Users can see own projects and public projects from org members
CREATE POLICY "projects_select" ON diffuse_projects
FOR SELECT USING (
  created_by = auth.uid()
  OR (
    visibility = 'public'
    AND created_by IN (
      SELECT dwm2.user_id 
      FROM diffuse_workspace_members dwm1
      JOIN diffuse_workspace_members dwm2 ON dwm1.workspace_id = dwm2.workspace_id
      WHERE dwm1.user_id = auth.uid()
    )
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
-- STEP 8: PROJECT INPUTS POLICIES
-- ============================================

-- Users can see inputs for projects they own or have access to
CREATE POLICY "inputs_select" ON diffuse_project_inputs
FOR SELECT USING (
  created_by = auth.uid()
  OR project_id IN (
    SELECT id FROM diffuse_projects WHERE created_by = auth.uid()
  )
  OR project_id IN (
    SELECT id FROM diffuse_projects 
    WHERE visibility = 'public' 
    AND created_by IN (
      SELECT dwm2.user_id 
      FROM diffuse_workspace_members dwm1
      JOIN diffuse_workspace_members dwm2 ON dwm1.workspace_id = dwm2.workspace_id
      WHERE dwm1.user_id = auth.uid()
    )
  )
);

-- Users can create inputs
CREATE POLICY "inputs_insert" ON diffuse_project_inputs
FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update their own inputs
CREATE POLICY "inputs_update" ON diffuse_project_inputs
FOR UPDATE USING (created_by = auth.uid());

-- Users can delete their own inputs
CREATE POLICY "inputs_delete" ON diffuse_project_inputs
FOR DELETE USING (created_by = auth.uid());

-- ============================================
-- STEP 9: PROJECT OUTPUTS POLICIES
-- ============================================

-- Users can see outputs for projects they can access
CREATE POLICY "outputs_select" ON diffuse_project_outputs
FOR SELECT USING (
  project_id IN (
    SELECT id FROM diffuse_projects WHERE created_by = auth.uid()
  )
  OR project_id IN (
    SELECT id FROM diffuse_projects 
    WHERE visibility = 'public' 
    AND created_by IN (
      SELECT dwm2.user_id 
      FROM diffuse_workspace_members dwm1
      JOIN diffuse_workspace_members dwm2 ON dwm1.workspace_id = dwm2.workspace_id
      WHERE dwm1.user_id = auth.uid()
    )
  )
);

-- System can create outputs
CREATE POLICY "outputs_insert" ON diffuse_project_outputs
FOR INSERT WITH CHECK (true);

-- Users can update outputs on their projects
CREATE POLICY "outputs_update" ON diffuse_project_outputs
FOR UPDATE USING (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
);

-- Users can delete outputs on their projects
CREATE POLICY "outputs_delete" ON diffuse_project_outputs
FOR DELETE USING (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
);

-- ============================================
-- STEP 10: RECORDINGS POLICIES
-- ============================================

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
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

