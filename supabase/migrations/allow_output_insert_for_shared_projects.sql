-- Allow inserting outputs for any user who can see the project (owner or shared org member).
-- Previously only project owner could insert; org members could run the workflow API but RLS blocked the insert.
DROP POLICY IF EXISTS "outputs_insert" ON diffuse_project_outputs;

CREATE POLICY "outputs_insert" ON diffuse_project_outputs
FOR INSERT WITH CHECK (
  project_id IN (SELECT id FROM diffuse_projects WHERE created_by = auth.uid())
  OR project_id IN (
    SELECT id FROM diffuse_projects
    WHERE visibility = 'public'
    AND visible_to_orgs && ARRAY(SELECT get_my_workspace_ids())::text[]
  )
);
