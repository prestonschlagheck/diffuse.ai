-- ============================================
-- DIFFUSE.AI - Security Advisor Fixes
-- Run this in your Supabase SQL Editor
-- ============================================
-- Fixes:
-- 1. Security Definer Views (2 errors)
-- 2. Function Search Path Mutable (5 warnings)
-- 3. RLS Policy Always True (1 warning)
-- 
-- Note: "Leaked Password Protection Disabled" must be
-- enabled in Supabase Dashboard > Authentication > Settings
-- ============================================


-- ============================================
-- FIX 1: SECURITY DEFINER VIEWS
-- Convert views to use SECURITY INVOKER (default, but explicit is better)
-- This ensures RLS is enforced based on the querying user, not the view creator
-- ============================================

-- Drop and recreate user_workspaces view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS user_workspaces;

CREATE VIEW user_workspaces 
WITH (security_invoker = true)
AS
SELECT 
    w.*,
    m.role,
    m.joined_at
FROM diffuse_workspaces w
JOIN diffuse_workspace_members m ON w.id = m.workspace_id
WHERE m.user_id = auth.uid();

-- Drop and recreate user_project_counts view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS user_project_counts;

CREATE VIEW user_project_counts
WITH (security_invoker = true)
AS
SELECT 
    created_by as user_id,
    COUNT(*) as project_count
FROM diffuse_projects
WHERE status != 'archived'
GROUP BY created_by;


-- ============================================
-- FIX 2: FUNCTION SEARCH PATH MUTABLE
-- Add SET search_path = public to all SECURITY DEFINER functions
-- This prevents search path injection attacks
-- ============================================

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix upsert_recent_project function
CREATE OR REPLACE FUNCTION upsert_recent_project(
  p_user_id UUID,
  p_project_id UUID,
  p_project_name TEXT
) RETURNS VOID AS $$
BEGIN
  -- Insert or update the recent project
  INSERT INTO user_recent_projects (user_id, project_id, project_name, viewed_at)
  VALUES (p_user_id, p_project_id, p_project_name, NOW())
  ON CONFLICT (user_id, project_id) 
  DO UPDATE SET 
    project_name = EXCLUDED.project_name,
    viewed_at = NOW();
  
  -- Delete old entries, keeping only the 10 most recent
  DELETE FROM user_recent_projects
  WHERE user_id = p_user_id
    AND id NOT IN (
      SELECT id FROM user_recent_projects
      WHERE user_id = p_user_id
      ORDER BY viewed_at DESC
      LIMIT 10
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix delete_empty_organization function
CREATE OR REPLACE FUNCTION delete_empty_organization()
RETURNS TRIGGER AS $$
DECLARE
    member_count INTEGER;
BEGIN
    -- Count remaining members in the organization
    SELECT COUNT(*) INTO member_count
    FROM diffuse_workspace_members
    WHERE workspace_id = OLD.workspace_id;
    
    -- If no members remain, handle cleanup
    IF member_count = 0 THEN
        -- Disassociate projects from the organization (they become personal projects)
        -- The projects still belong to their creators (created_by field)
        UPDATE diffuse_projects 
        SET workspace_id = NULL 
        WHERE workspace_id = OLD.workspace_id;
        
        -- Now delete the empty workspace
        DELETE FROM diffuse_workspaces WHERE id = OLD.workspace_id;
        
        RAISE NOTICE 'Deleted empty organization: %. Projects converted to personal projects.', OLD.workspace_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop is_workspace_admin if it exists (was referenced in error but may be stale)
DROP FUNCTION IF EXISTS is_workspace_admin(UUID, UUID);


-- ============================================
-- FIX 3: RLS POLICY ALWAYS TRUE
-- The outputs_insert policy uses WITH CHECK (true) which is overly permissive
-- Fix: Only allow inserts on projects the user owns
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "outputs_insert" ON diffuse_project_outputs;

-- Create a proper policy that checks project ownership
CREATE POLICY "outputs_insert" ON diffuse_project_outputs
FOR INSERT WITH CHECK (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
);


-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check views are using security_invoker
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname IN ('user_workspaces', 'user_project_counts');

-- Check functions have search_path set
SELECT 
    proname as function_name,
    prosecdef as is_security_definer,
    proconfig as config
FROM pg_proc 
WHERE proname IN (
    'handle_new_user', 
    'update_updated_at_column', 
    'upsert_recent_project', 
    'delete_empty_organization',
    'get_my_workspace_ids',
    'get_my_workspace_member_ids'
);

-- Check RLS policies on outputs table
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'diffuse_project_outputs';


-- ============================================
-- MANUAL STEP REQUIRED:
-- ============================================
-- Enable "Leaked Password Protection" in Supabase:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Settings
-- 3. Scroll to "Leaked Password Protection"
-- 4. Enable it
-- ============================================

