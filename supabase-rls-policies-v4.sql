-- ============================================
-- DIFFUSE.AI - Row Level Security Policies V4
-- ============================================
-- Uses SECURITY DEFINER function to safely get workspace IDs
-- without triggering RLS recursion.
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Drop old functions
DROP FUNCTION IF EXISTS is_workspace_member(UUID, UUID);
DROP FUNCTION IF EXISTS is_workspace_admin(UUID, UUID);
DROP FUNCTION IF EXISTS users_share_workspace(UUID, UUID);
DROP FUNCTION IF EXISTS get_my_workspace_ids();
DROP FUNCTION IF EXISTS get_my_workspace_member_ids();

-- ============================================
-- STEP 2: CREATE HELPER FUNCTIONS
-- ============================================
-- These run as superuser and bypass RLS, returning only IDs (safe)

-- Get workspace IDs for the current user
CREATE OR REPLACE FUNCTION get_my_workspace_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT workspace_id 
  FROM diffuse_workspace_members 
  WHERE user_id = auth.uid();
$$;

-- Get user IDs of people in the same workspaces as current user
CREATE OR REPLACE FUNCTION get_my_workspace_member_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT DISTINCT user_id 
  FROM diffuse_workspace_members 
  WHERE workspace_id IN (
    SELECT workspace_id 
    FROM diffuse_workspace_members 
    WHERE user_id = auth.uid()
  );
$$;

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
-- STEP 4: WORKSPACE MEMBERS
-- ============================================

-- Users can see members in their workspaces
CREATE POLICY "members_select" ON diffuse_workspace_members
FOR SELECT USING (
  user_id = auth.uid()
  OR workspace_id IN (SELECT get_my_workspace_ids())
);

-- Users can join orgs
CREATE POLICY "members_insert" ON diffuse_workspace_members
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own membership
CREATE POLICY "members_update" ON diffuse_workspace_members
FOR UPDATE USING (user_id = auth.uid());

-- Users can leave orgs
CREATE POLICY "members_delete" ON diffuse_workspace_members
FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- STEP 5: WORKSPACES
-- ============================================

-- Users can see workspaces they own, are members of, or have invite codes
CREATE POLICY "workspaces_select" ON diffuse_workspaces
FOR SELECT USING (
  owner_id = auth.uid()
  OR id IN (SELECT get_my_workspace_ids())
  OR invite_code IS NOT NULL
);

-- Users can create workspaces
CREATE POLICY "workspaces_insert" ON diffuse_workspaces
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Owners can update
CREATE POLICY "workspaces_update" ON diffuse_workspaces
FOR UPDATE USING (owner_id = auth.uid());

-- Owners can delete
CREATE POLICY "workspaces_delete" ON diffuse_workspaces
FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- STEP 6: USER PROFILES
-- ============================================

-- Users can see profiles of people in their workspaces
CREATE POLICY "profiles_select" ON user_profiles
FOR SELECT USING (
  id = auth.uid()
  OR id IN (SELECT get_my_workspace_member_ids())
);

-- Users can insert their own profile
CREATE POLICY "profiles_insert" ON user_profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update" ON user_profiles
FOR UPDATE USING (id = auth.uid());

-- ============================================
-- STEP 7: PROJECTS
-- ============================================

-- Users can see their own projects and public projects from workspace members
CREATE POLICY "projects_select" ON diffuse_projects
FOR SELECT USING (
  created_by = auth.uid()
  OR (
    visibility = 'public'
    AND created_by IN (SELECT get_my_workspace_member_ids())
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
-- STEP 8: PROJECT INPUTS
-- ============================================

-- Users can see inputs for accessible projects
CREATE POLICY "inputs_select" ON diffuse_project_inputs
FOR SELECT USING (
  created_by = auth.uid()
  OR project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
  OR project_id IN (
    SELECT id FROM diffuse_projects 
    WHERE visibility = 'public' 
    AND created_by IN (SELECT get_my_workspace_member_ids())
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
-- STEP 9: PROJECT OUTPUTS
-- ============================================

-- Users can see outputs for accessible projects
CREATE POLICY "outputs_select" ON diffuse_project_outputs
FOR SELECT USING (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
  OR project_id IN (
    SELECT id FROM diffuse_projects 
    WHERE visibility = 'public' 
    AND created_by IN (SELECT get_my_workspace_member_ids())
  )
);

-- System can create outputs
CREATE POLICY "outputs_insert" ON diffuse_project_outputs
FOR INSERT WITH CHECK (true);

-- Users can update/delete outputs on their projects
CREATE POLICY "outputs_update" ON diffuse_project_outputs
FOR UPDATE USING (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
);

CREATE POLICY "outputs_delete" ON diffuse_project_outputs
FOR DELETE USING (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
);

-- ============================================
-- STEP 10: RECORDINGS
-- ============================================

-- Users can only access their own recordings
CREATE POLICY "recordings_select" ON diffuse_recordings
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "recordings_insert" ON diffuse_recordings
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "recordings_update" ON diffuse_recordings
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "recordings_delete" ON diffuse_recordings
FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- VERIFICATION
-- ============================================
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

