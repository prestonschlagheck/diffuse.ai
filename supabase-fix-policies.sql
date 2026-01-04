-- ============================================
-- FIX: RLS Policies (Infinite Recursion Fix)
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. DROP ALL EXISTING POLICIES
-- ============================================

-- Drop workspace member policies (these cause recursion)
DROP POLICY IF EXISTS "Users can view workspace members" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "Admins can add members" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "Admins can update members" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "Admins can remove members" ON diffuse_workspace_members;

-- Drop workspace policies
DROP POLICY IF EXISTS "Users can view member workspaces" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Owners can update workspaces" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Owners can delete workspaces" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Anyone can lookup workspace by invite code" ON diffuse_workspaces;

-- Drop project policies
DROP POLICY IF EXISTS "Users can view accessible projects" ON diffuse_projects;
DROP POLICY IF EXISTS "Users can create projects" ON diffuse_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON diffuse_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON diffuse_projects;

-- Drop input policies
DROP POLICY IF EXISTS "Users can view project inputs" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "Users can add inputs to own projects" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "Users can delete inputs from own projects" ON diffuse_project_inputs;

-- Drop output policies
DROP POLICY IF EXISTS "Users can view project outputs" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "Users can add outputs to own projects" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "Users can update outputs in own projects" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "Users can delete outputs from own projects" ON diffuse_project_outputs;


-- ============================================
-- 2. CREATE HELPER FUNCTION (avoids recursion)
-- ============================================

-- This function checks membership without triggering RLS
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM diffuse_workspace_members
        WHERE workspace_id = workspace_uuid 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This function checks if user is admin of workspace
CREATE OR REPLACE FUNCTION is_workspace_admin(workspace_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM diffuse_workspace_members
        WHERE workspace_id = workspace_uuid 
        AND user_id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 3. WORKSPACE POLICIES (FIXED)
-- ============================================

-- Users can view workspaces they own or are members of
CREATE POLICY "workspace_select"
    ON diffuse_workspaces FOR SELECT
    USING (
        owner_id = auth.uid() OR 
        is_workspace_member(id)
    );

-- Users can create workspaces (they become owner)
CREATE POLICY "workspace_insert"
    ON diffuse_workspaces FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Only owners can update workspaces
CREATE POLICY "workspace_update"
    ON diffuse_workspaces FOR UPDATE
    USING (owner_id = auth.uid());

-- Only owners can delete workspaces
CREATE POLICY "workspace_delete"
    ON diffuse_workspaces FOR DELETE
    USING (owner_id = auth.uid());


-- ============================================
-- 4. WORKSPACE MEMBERS POLICIES (FIXED)
-- ============================================

-- Users can view members of workspaces they belong to
CREATE POLICY "members_select"
    ON diffuse_workspace_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        is_workspace_member(workspace_id)
    );

-- Users can join workspaces (insert themselves) or admins can add members
CREATE POLICY "members_insert"
    ON diffuse_workspace_members FOR INSERT
    WITH CHECK (
        user_id = auth.uid() OR
        is_workspace_admin(workspace_id)
    );

-- Admins can update member roles
CREATE POLICY "members_update"
    ON diffuse_workspace_members FOR UPDATE
    USING (is_workspace_admin(workspace_id));

-- Users can leave (delete themselves) or admins can remove members
CREATE POLICY "members_delete"
    ON diffuse_workspace_members FOR DELETE
    USING (
        user_id = auth.uid() OR
        is_workspace_admin(workspace_id)
    );


-- ============================================
-- 5. PROJECT POLICIES (FIXED)
-- ============================================

-- Users can view their own projects OR public projects in their workspaces
CREATE POLICY "projects_select"
    ON diffuse_projects FOR SELECT
    USING (
        created_by = auth.uid() OR
        (visibility = 'public' AND workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
    );

-- Users can create projects
CREATE POLICY "projects_insert"
    ON diffuse_projects FOR INSERT
    WITH CHECK (created_by = auth.uid());

-- Users can update their own projects
CREATE POLICY "projects_update"
    ON diffuse_projects FOR UPDATE
    USING (created_by = auth.uid());

-- Users can delete their own projects
CREATE POLICY "projects_delete"
    ON diffuse_projects FOR DELETE
    USING (created_by = auth.uid());


-- ============================================
-- 6. PROJECT INPUTS POLICIES (FIXED)
-- ============================================

-- Users can view inputs for projects they own or can access
CREATE POLICY "inputs_select"
    ON diffuse_project_inputs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM diffuse_projects p
            WHERE p.id = project_id
            AND (
                p.created_by = auth.uid() OR
                (p.visibility = 'public' AND p.workspace_id IS NOT NULL AND is_workspace_member(p.workspace_id))
            )
        )
    );

-- Users can add inputs to their own projects
CREATE POLICY "inputs_insert"
    ON diffuse_project_inputs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM diffuse_projects p
            WHERE p.id = project_id AND p.created_by = auth.uid()
        )
    );

-- Users can delete inputs from their own projects
CREATE POLICY "inputs_delete"
    ON diffuse_project_inputs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM diffuse_projects p
            WHERE p.id = project_id AND p.created_by = auth.uid()
        )
    );


-- ============================================
-- 7. PROJECT OUTPUTS POLICIES (FIXED)
-- ============================================

-- Users can view outputs for projects they own or can access
CREATE POLICY "outputs_select"
    ON diffuse_project_outputs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM diffuse_projects p
            WHERE p.id = project_id
            AND (
                p.created_by = auth.uid() OR
                (p.visibility = 'public' AND p.workspace_id IS NOT NULL AND is_workspace_member(p.workspace_id))
            )
        )
    );

-- Users can add outputs to their own projects
CREATE POLICY "outputs_insert"
    ON diffuse_project_outputs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM diffuse_projects p
            WHERE p.id = project_id AND p.created_by = auth.uid()
        )
    );

-- Users can update outputs in their own projects
CREATE POLICY "outputs_update"
    ON diffuse_project_outputs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM diffuse_projects p
            WHERE p.id = project_id AND p.created_by = auth.uid()
        )
    );

-- Users can delete outputs from their own projects
CREATE POLICY "outputs_delete"
    ON diffuse_project_outputs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM diffuse_projects p
            WHERE p.id = project_id AND p.created_by = auth.uid()
        )
    );


-- ============================================
-- DONE!
-- ============================================
-- The policies now use SECURITY DEFINER functions
-- to check membership without triggering RLS recursion.
-- ============================================

