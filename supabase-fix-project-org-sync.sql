-- ============================================
-- FIX PROJECT-ORGANIZATION SYNC
-- Run this in your Supabase SQL Editor
-- ============================================

-- This script fixes projects that aren't showing up under their organizations.
-- There are two issues being addressed:
-- 1. Some projects have NULL workspace_id (not linked to any org)
-- 2. Projects with workspace_id don't have visible_to_orgs populated

-- ============================================
-- PART A: Fix specific DPJ Media projects
-- ============================================
-- These 2 projects have NULL workspace_id and need to be linked to DPJ Media & GenAI Group

UPDATE diffuse_projects
SET 
  workspace_id = '55335401-b508-4a30-b06e-4b6759510f4b',
  visible_to_orgs = ARRAY['55335401-b508-4a30-b06e-4b6759510f4b'],
  visibility = 'public'
WHERE 
  workspace_id IS NULL
  AND (name ILIKE '%Cell Phone Usage%' OR name ILIKE '%USH Preston%Development%');

-- ============================================
-- PART B: Find any other projects with NULL workspace_id
-- ============================================
-- Run this query to check if there are other projects that need manual fixing
-- If results appear, you'll need to determine which workspace they belong to

SELECT id, name, workspace_id, created_by, created_at
FROM diffuse_projects
WHERE workspace_id IS NULL;

-- ============================================
-- PART C: Sync visible_to_orgs for ALL projects
-- ============================================
-- For all projects that have workspace_id but empty visible_to_orgs,
-- automatically populate visible_to_orgs with the workspace_id

UPDATE diffuse_projects 
SET 
  visible_to_orgs = ARRAY[workspace_id::text],
  visibility = 'public'
WHERE 
  workspace_id IS NOT NULL 
  AND (visible_to_orgs IS NULL OR visible_to_orgs = '{}');

-- ============================================
-- VERIFICATION: Check that all projects with workspace_id now have visible_to_orgs
-- ============================================

SELECT 
  id, 
  name, 
  workspace_id, 
  visible_to_orgs, 
  visibility,
  created_at
FROM diffuse_projects
WHERE workspace_id IS NOT NULL
ORDER BY created_at DESC;
