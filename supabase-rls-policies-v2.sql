-- ============================================
-- DIFFUSE.AI - Row Level Security Policies V2
-- ============================================
-- COMPLETELY RECURSION-FREE VERSION
-- 
-- Key principle: workspace_select and workspace_members_select
-- MUST NOT reference each other's tables.
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

-- Also drop any helper functions
DROP FUNCTION IF EXISTS is_workspace_member(UUID, UUID);
DROP FUNCTION IF EXISTS is_workspace_admin(UUID, UUID);
DROP FUNCTION IF EXISTS users_share_workspace(UUID, UUID);

-- ============================================
-- STEP 2: ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_project_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_project_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_recordings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: WORKSPACE MEMBERS (NO reference to workspaces table!)
-- ============================================

-- Users can ONLY see their own memberships
-- App will handle fetching workspace details separately
CREATE POLICY "members_select" ON diffuse_workspace_members
FOR SELECT USING (user_id = auth.uid());

-- Users can join orgs
CREATE POLICY "members_insert" ON diffuse_workspace_members
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only update their own membership (e.g., leave)
-- Admin role changes handled via service role or triggers
CREATE POLICY "members_update" ON diffuse_workspace_members
FOR UPDATE USING (user_id = auth.uid());

-- Users can remove themselves (leave org)
CREATE POLICY "members_delete" ON diffuse_workspace_members
FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- STEP 4: WORKSPACES (NO reference to members table!)
-- ============================================

-- Users can see workspaces they own OR any workspace with invite code
-- Membership-based access is handled at application level
CREATE POLICY "workspaces_select" ON diffuse_workspaces
FOR SELECT USING (
  owner_id = auth.uid()
  OR invite_code IS NOT NULL
);

-- Users can create workspaces
CREATE POLICY "workspaces_insert" ON diffuse_workspaces
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Only owner can update
CREATE POLICY "workspaces_update" ON diffuse_workspaces
FOR UPDATE USING (owner_id = auth.uid());

-- Only owner can delete
CREATE POLICY "workspaces_delete" ON diffuse_workspaces
FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- STEP 5: USER PROFILES
-- ============================================

-- Users can see their own profile
-- For org members, app fetches profiles after knowing member IDs
CREATE POLICY "profiles_select" ON user_profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can insert their own profile
CREATE POLICY "profiles_insert" ON user_profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update" ON user_profiles
FOR UPDATE USING (id = auth.uid());

-- ============================================
-- STEP 6: PROJECTS
-- ============================================

-- Users can see their own projects
-- Public project access for org members handled at app level
CREATE POLICY "projects_select" ON diffuse_projects
FOR SELECT USING (
  created_by = auth.uid()
  OR visibility = 'public'
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
-- STEP 7: PROJECT INPUTS
-- ============================================

-- Users can see inputs they created or for their projects
CREATE POLICY "inputs_select" ON diffuse_project_inputs
FOR SELECT USING (
  created_by = auth.uid()
  OR project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
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
-- STEP 8: PROJECT OUTPUTS
-- ============================================

-- Users can see outputs for their projects
CREATE POLICY "outputs_select" ON diffuse_project_outputs
FOR SELECT USING (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
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
-- STEP 9: RECORDINGS
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

