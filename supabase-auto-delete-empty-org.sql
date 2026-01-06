-- ============================================
-- AUTO-DELETE EMPTY ORGANIZATIONS
-- When the last member leaves an organization, automatically delete it
-- Projects are NOT deleted - they become personal projects (workspace_id = NULL)
-- Run this in your Supabase SQL Editor
-- ============================================

-- Function to check and delete empty organizations
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires AFTER a member is deleted
DROP TRIGGER IF EXISTS on_workspace_member_deleted ON diffuse_workspace_members;

CREATE TRIGGER on_workspace_member_deleted
    AFTER DELETE ON diffuse_workspace_members
    FOR EACH ROW
    EXECUTE FUNCTION delete_empty_organization();


-- ============================================
-- OPTIONAL: Change foreign key to SET NULL instead of CASCADE
-- This prevents accidental project deletion if workspace is deleted directly
-- Run this if you want extra protection
-- ============================================

-- First drop the existing constraint
-- ALTER TABLE diffuse_projects DROP CONSTRAINT IF EXISTS diffuse_projects_workspace_id_fkey;

-- Re-add with SET NULL behavior
-- ALTER TABLE diffuse_projects 
-- ADD CONSTRAINT diffuse_projects_workspace_id_fkey 
-- FOREIGN KEY (workspace_id) REFERENCES diffuse_workspaces(id) ON DELETE SET NULL;


-- ============================================
-- VERIFICATION QUERY (optional)
-- ============================================
-- SELECT tgname, tgrelid::regclass, tgenabled 
-- FROM pg_trigger 
-- WHERE tgname = 'on_workspace_member_deleted';
