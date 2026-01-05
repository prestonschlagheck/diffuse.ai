-- ============================================
-- ROLE SYSTEM UPDATE - FINAL VERSION
-- ============================================
-- Old roles: 'admin', 'member'
-- New roles: 'admin', 'editor', 'viewer'
-- (owner is determined by owner_id in diffuse_workspaces, not stored in members table)
-- ============================================

-- Step 1: Add new values to the user_role ENUM type
-- We need to add 'editor' and 'viewer' to the existing enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'viewer';

-- Step 2: Update existing 'member' roles to 'viewer'
-- NOTE: Run this AFTER committing the above ALTER TYPE commands
-- You may need to run the ALTER TYPE commands first, commit, then run this separately
UPDATE diffuse_workspace_members 
SET role = 'viewer' 
WHERE role = 'member';

-- Step 3: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_workspace_members_role 
ON diffuse_workspace_members(role);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_user 
ON diffuse_workspace_members(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner 
ON diffuse_workspaces(owner_id);

-- ============================================
-- VERIFY THE CHANGES
-- ============================================

-- Check current enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_role'::regtype
ORDER BY enumsortorder;

-- Check role distribution
SELECT role, COUNT(*) as member_count 
FROM diffuse_workspace_members 
GROUP BY role;

-- ============================================
-- IF YOU NEED TO REMOVE 'member' FROM ENUM
-- (Optional - only if you want to clean up the old value)
-- This is more complex and requires recreating the type
-- ============================================
-- 
-- -- Create new enum type
-- CREATE TYPE user_role_new AS ENUM ('admin', 'editor', 'viewer');
-- 
-- -- Update the column to use the new type
-- ALTER TABLE diffuse_workspace_members 
-- ALTER COLUMN role TYPE user_role_new 
-- USING role::text::user_role_new;
-- 
-- -- Drop old type and rename new one
-- DROP TYPE user_role;
-- ALTER TYPE user_role_new RENAME TO user_role;
-- ============================================
