-- ============================================
-- DIFFUSE.AI - MASTER MIGRATION FILE
-- ============================================
-- 
-- This file consolidates ALL database changes in the correct order.
-- Run this in your Supabase SQL Editor.
--
-- IMPORTANT: If you have an existing database, some statements may
-- fail with "already exists" errors. This is OK - just continue.
--
-- For a FRESH database, run supabase-schema.sql FIRST, then this file.
--
-- Created: 2026-01-16
-- ============================================


-- ============================================
-- SECTION 1: SCHEMA UPDATES (New Columns)
-- ============================================

-- 1.1 Add visible_to_orgs column to projects for organization-based visibility
ALTER TABLE diffuse_projects
ADD COLUMN IF NOT EXISTS visible_to_orgs TEXT[] DEFAULT '{}';

-- 1.2 Add project_type column to projects (project vs advertisement)
ALTER TABLE diffuse_projects 
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'project' 
CHECK (project_type IN ('project', 'advertisement'));

-- 1.3 Add output_type column to outputs (article vs ad)
ALTER TABLE diffuse_project_outputs 
ADD COLUMN IF NOT EXISTS output_type TEXT DEFAULT 'article' 
CHECK (output_type IN ('article', 'ad'));

-- 1.4 Add deleted_at for soft deletes on inputs
ALTER TABLE diffuse_project_inputs
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 1.5 Add metadata column to inputs
ALTER TABLE diffuse_project_inputs
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

-- 1.6 Add deleted_at for soft deletes on outputs
ALTER TABLE diffuse_project_outputs 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 1.7 Add status column to recordings
ALTER TABLE diffuse_recordings
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'recorded' 
CHECK (status IN ('recorded', 'generating', 'transcribed'));

-- 1.8 Add original_transcription to recordings
ALTER TABLE diffuse_recordings
ADD COLUMN IF NOT EXISTS original_transcription TEXT DEFAULT NULL;

-- 1.9 Add plan column to workspaces for enterprise plans
ALTER TABLE diffuse_workspaces
ADD COLUMN IF NOT EXISTS plan TEXT CHECK (plan IN ('enterprise_pro', 'enterprise_pro_max'));


-- ============================================
-- SECTION 2: ENUM UPDATES
-- ============================================

-- 2.1 Add new role types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'editor' AND enumtypid = 'user_role'::regtype) THEN
    ALTER TYPE user_role ADD VALUE 'editor';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add editor to user_role enum';
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'viewer' AND enumtypid = 'user_role'::regtype) THEN
    ALTER TYPE user_role ADD VALUE 'viewer';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add viewer to user_role enum';
END $$;

-- 2.2 Add new input types (image, document)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'image' AND enumtypid = 'input_type'::regtype) THEN
    ALTER TYPE input_type ADD VALUE 'image';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add image to input_type enum';
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'document' AND enumtypid = 'input_type'::regtype) THEN
    ALTER TYPE input_type ADD VALUE 'document';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add document to input_type enum';
END $$;


-- ============================================
-- SECTION 3: NEW TABLES
-- ============================================

-- 3.1 Recent Projects Table
CREATE TABLE IF NOT EXISTS user_recent_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES diffuse_projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);


-- ============================================
-- SECTION 4: INDEXES
-- ============================================

-- 4.1 Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON diffuse_projects(project_type);

-- 4.2 Output indexes
CREATE INDEX IF NOT EXISTS idx_outputs_output_type ON diffuse_project_outputs(output_type);
CREATE INDEX IF NOT EXISTS idx_project_outputs_deleted_at ON diffuse_project_outputs(deleted_at);

-- 4.3 Input indexes
CREATE INDEX IF NOT EXISTS idx_project_inputs_deleted_at ON diffuse_project_inputs(project_id, deleted_at);

-- 4.4 Recent projects indexes
CREATE INDEX IF NOT EXISTS idx_user_recent_projects_user_id ON user_recent_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recent_projects_viewed_at ON user_recent_projects(viewed_at DESC);

-- 4.5 Workspace member indexes
CREATE INDEX IF NOT EXISTS idx_workspace_members_role ON diffuse_workspace_members(role);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_user ON diffuse_workspace_members(workspace_id, user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON diffuse_workspaces(owner_id);


-- ============================================
-- SECTION 5: HELPER FUNCTIONS (RLS)
-- ============================================

-- Drop old unused functions (but NOT the ones currently in use by policies)
DROP FUNCTION IF EXISTS is_workspace_member(UUID, UUID);
DROP FUNCTION IF EXISTS is_workspace_admin(UUID, UUID);
DROP FUNCTION IF EXISTS users_share_workspace(UUID, UUID);
-- NOTE: get_my_workspace_ids and get_my_workspace_member_ids are NOT dropped
-- because existing policies depend on them. We use CREATE OR REPLACE instead.

-- 5.1 Get workspace IDs for the current user
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

-- 5.2 Get user IDs of people in the same workspaces
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
-- SECTION 6: TRIGGER FUNCTIONS
-- ============================================

-- 6.1 Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, subscription_tier, user_level)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        'free',
        'individual'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6.2 Update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 6.3 Upsert recent project
CREATE OR REPLACE FUNCTION upsert_recent_project(
  p_user_id UUID,
  p_project_id UUID,
  p_project_name TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_recent_projects (user_id, project_id, project_name, viewed_at)
  VALUES (p_user_id, p_project_id, p_project_name, NOW())
  ON CONFLICT (user_id, project_id) 
  DO UPDATE SET 
    project_name = EXCLUDED.project_name,
    viewed_at = NOW();
  
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

-- 6.4 Delete empty organization when last member leaves
CREATE OR REPLACE FUNCTION delete_empty_organization()
RETURNS TRIGGER AS $$
DECLARE
    member_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO member_count
    FROM diffuse_workspace_members
    WHERE workspace_id = OLD.workspace_id;
    
    IF member_count = 0 THEN
        UPDATE diffuse_projects 
        SET workspace_id = NULL 
        WHERE workspace_id = OLD.workspace_id;
        
        DELETE FROM diffuse_workspaces WHERE id = OLD.workspace_id;
        
        RAISE NOTICE 'Deleted empty organization: %. Projects converted to personal projects.', OLD.workspace_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================
-- SECTION 7: TRIGGERS
-- ============================================

-- 7.1 New user trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7.2 Empty org cleanup trigger
DROP TRIGGER IF EXISTS on_workspace_member_deleted ON diffuse_workspace_members;
CREATE TRIGGER on_workspace_member_deleted
    AFTER DELETE ON diffuse_workspace_members
    FOR EACH ROW
    EXECUTE FUNCTION delete_empty_organization();


-- ============================================
-- SECTION 8: ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_project_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_project_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diffuse_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recent_projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8.1 USER PROFILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "profiles_insert" ON user_profiles;
DROP POLICY IF EXISTS "profiles_update" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "profiles_select" ON user_profiles
FOR SELECT USING (
  id = auth.uid()
  OR id IN (SELECT get_my_workspace_member_ids())
);

CREATE POLICY "profiles_insert" ON user_profiles
FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON user_profiles
FOR UPDATE USING (id = auth.uid());

-- ============================================
-- 8.2 WORKSPACE POLICIES
-- ============================================
DROP POLICY IF EXISTS "workspaces_select" ON diffuse_workspaces;
DROP POLICY IF EXISTS "workspaces_insert" ON diffuse_workspaces;
DROP POLICY IF EXISTS "workspaces_update" ON diffuse_workspaces;
DROP POLICY IF EXISTS "workspaces_delete" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Users can view member workspaces" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Owners can update workspaces" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Owners can delete workspaces" ON diffuse_workspaces;
DROP POLICY IF EXISTS "Anyone can lookup workspace by invite code" ON diffuse_workspaces;

CREATE POLICY "workspaces_select" ON diffuse_workspaces
FOR SELECT USING (
  owner_id = auth.uid()
  OR id IN (SELECT get_my_workspace_ids())
  OR invite_code IS NOT NULL
);

CREATE POLICY "workspaces_insert" ON diffuse_workspaces
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update" ON diffuse_workspaces
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete" ON diffuse_workspaces
FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- 8.3 WORKSPACE MEMBERS POLICIES
-- ============================================
DROP POLICY IF EXISTS "members_select" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "members_insert" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "members_update" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "members_delete" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "Admins can add members" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "Admins can update members" ON diffuse_workspace_members;
DROP POLICY IF EXISTS "Admins can remove members" ON diffuse_workspace_members;

CREATE POLICY "members_select" ON diffuse_workspace_members
FOR SELECT USING (
  user_id = auth.uid()
  OR workspace_id IN (SELECT get_my_workspace_ids())
);

CREATE POLICY "members_insert" ON diffuse_workspace_members
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "members_update" ON diffuse_workspace_members
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "members_delete" ON diffuse_workspace_members
FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 8.4 PROJECTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "projects_select" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_insert" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_update" ON diffuse_projects;
DROP POLICY IF EXISTS "projects_delete" ON diffuse_projects;
DROP POLICY IF EXISTS "Users can view accessible projects" ON diffuse_projects;
DROP POLICY IF EXISTS "Users can create projects" ON diffuse_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON diffuse_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON diffuse_projects;

CREATE POLICY "projects_select" ON diffuse_projects
FOR SELECT USING (
  created_by = auth.uid()
  OR (
    visibility = 'public'
    AND visible_to_orgs && ARRAY(SELECT get_my_workspace_ids())::text[]
  )
);

CREATE POLICY "projects_insert" ON diffuse_projects
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "projects_update" ON diffuse_projects
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "projects_delete" ON diffuse_projects
FOR DELETE USING (created_by = auth.uid());

-- ============================================
-- 8.5 PROJECT INPUTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "inputs_select" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "inputs_insert" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "inputs_update" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "inputs_delete" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "Users can view project inputs" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "Users can add inputs to own projects" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "Users can update their own inputs" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "Users can delete inputs from own projects" ON diffuse_project_inputs;
DROP POLICY IF EXISTS "Users can delete own project inputs" ON diffuse_project_inputs;

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

CREATE POLICY "inputs_insert" ON diffuse_project_inputs
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "inputs_update" ON diffuse_project_inputs
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "inputs_delete" ON diffuse_project_inputs
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM diffuse_projects 
    WHERE diffuse_projects.id = diffuse_project_inputs.project_id 
    AND diffuse_projects.created_by = auth.uid()
  )
);

-- ============================================
-- 8.6 PROJECT OUTPUTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "outputs_select" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "outputs_insert" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "outputs_update" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "outputs_delete" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "Users can view project outputs" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "Users can add outputs to own projects" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "Users can update outputs in own projects" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "Users can delete outputs from own projects" ON diffuse_project_outputs;
DROP POLICY IF EXISTS "Users can delete own project outputs" ON diffuse_project_outputs;

CREATE POLICY "outputs_select" ON diffuse_project_outputs
FOR SELECT USING (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
  OR project_id IN (
    SELECT id FROM diffuse_projects 
    WHERE visibility = 'public' 
    AND visible_to_orgs && ARRAY(SELECT get_my_workspace_ids())::text[]
  )
);

CREATE POLICY "outputs_insert" ON diffuse_project_outputs
FOR INSERT WITH CHECK (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
);

CREATE POLICY "outputs_update" ON diffuse_project_outputs
FOR UPDATE USING (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
);

CREATE POLICY "outputs_delete" ON diffuse_project_outputs
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM diffuse_projects 
    WHERE diffuse_projects.id = diffuse_project_outputs.project_id 
    AND diffuse_projects.created_by = auth.uid()
  )
);

-- ============================================
-- 8.7 RECORDINGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "recordings_select" ON diffuse_recordings;
DROP POLICY IF EXISTS "recordings_insert" ON diffuse_recordings;
DROP POLICY IF EXISTS "recordings_update" ON diffuse_recordings;
DROP POLICY IF EXISTS "recordings_delete" ON diffuse_recordings;
DROP POLICY IF EXISTS "Users can view own recordings" ON diffuse_recordings;
DROP POLICY IF EXISTS "Users can create own recordings" ON diffuse_recordings;
DROP POLICY IF EXISTS "Users can update own recordings" ON diffuse_recordings;
DROP POLICY IF EXISTS "Users can delete own recordings" ON diffuse_recordings;

CREATE POLICY "recordings_select" ON diffuse_recordings
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "recordings_insert" ON diffuse_recordings
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "recordings_update" ON diffuse_recordings
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "recordings_delete" ON diffuse_recordings
FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 8.8 RECENT PROJECTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view their own recent projects" ON user_recent_projects;
DROP POLICY IF EXISTS "Users can insert their own recent projects" ON user_recent_projects;
DROP POLICY IF EXISTS "Users can update their own recent projects" ON user_recent_projects;
DROP POLICY IF EXISTS "Users can delete their own recent projects" ON user_recent_projects;

CREATE POLICY "Users can view their own recent projects"
  ON user_recent_projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent projects"
  ON user_recent_projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recent projects"
  ON user_recent_projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent projects"
  ON user_recent_projects FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- SECTION 9: VIEWS (with security_invoker)
-- ============================================

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
-- SECTION 10: STORAGE BUCKETS
-- ============================================

-- 10.1 Recordings bucket (200MB limit for long recordings)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('recordings', 'recordings', false, 209715200)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 209715200;

-- 10.2 Project files bucket (200MB limit for long audio files)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-files', 'project-files', false, 209715200)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 209715200;


-- ============================================
-- SECTION 11: STORAGE POLICIES
-- ============================================

-- 11.1 Recordings storage policies
DROP POLICY IF EXISTS "Users can upload their own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own recordings" ON storage.objects;

CREATE POLICY "Users can upload their own recordings"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'recordings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own recordings"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'recordings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own recordings"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'recordings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 11.2 Project files storage policies
DROP POLICY IF EXISTS "Users can upload to own project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own project files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own project files" ON storage.objects;

CREATE POLICY "Users can upload to own project files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own project files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own project files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);


-- ============================================
-- SECTION 12: ENABLE REALTIME
-- ============================================

-- Enable realtime for tables used by the app
-- Using DO block to handle "already member" errors gracefully
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE diffuse_projects;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'diffuse_projects already in supabase_realtime';
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE diffuse_project_inputs;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'diffuse_project_inputs already in supabase_realtime';
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE diffuse_project_outputs;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'diffuse_project_outputs already in supabase_realtime';
END $$;


-- ============================================
-- SECTION 13: DATA MIGRATIONS
-- ============================================

-- 13.1 Update existing recordings with status
UPDATE diffuse_recordings
SET status = CASE 
  WHEN transcription IS NOT NULL AND transcription != '' THEN 'transcribed'
  ELSE 'recorded'
END
WHERE status IS NULL;

-- 13.2 Backfill original_transcription
UPDATE diffuse_recordings 
SET original_transcription = transcription 
WHERE transcription IS NOT NULL AND original_transcription IS NULL;

-- 13.3 Convert old 'member' roles to 'viewer'
UPDATE diffuse_workspace_members 
SET role = 'viewer' 
WHERE role = 'member';


-- ============================================
-- VERIFICATION QUERIES (Run separately to check)
-- ============================================

-- Check all tables have RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check all policies
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

-- Check realtime is enabled
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Check storage buckets
-- SELECT id, name, public FROM storage.buckets;


-- ============================================
-- DONE!
-- ============================================
-- 
-- Next steps:
-- 1. Enable "Leaked Password Protection" in Supabase Dashboard:
--    Authentication > Settings > Leaked Password Protection
--
-- 2. Set up your .env.local file with:
--    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
--
-- ============================================
