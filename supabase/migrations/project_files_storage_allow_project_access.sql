-- Allow all users with project access (owner or org viewers/editors) to read project-files (e.g. cover photos).
-- Path format: (storage.foldername(name))[1] = uploader user id, [2] = project_id.
DROP POLICY IF EXISTS "Users can view own project files" ON storage.objects;

CREATE POLICY "Users can view own project files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files'
  AND (
    -- Uploader can always read their files
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Anyone who can see the project can read its files (owner or org member with visibility)
    (array_length(storage.foldername(name), 1) >= 2 AND (storage.foldername(name))[2] IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM diffuse_projects p
      WHERE p.id = ((storage.foldername(name))[2])::uuid
      AND (
        p.created_by = auth.uid()
        OR (
          p.visibility = 'public'
          AND p.visible_to_orgs && ARRAY(SELECT get_my_workspace_ids())::text[]
        )
      )
    ))
  )
);
