-- One-time sync: set each output's cover_photo_path from its project's cover_photo input.
-- Projects with no cover_photo input are unchanged (outputs keep current cover_photo_path, often null).
-- Run once in Supabase SQL Editor or: supabase db execute -f supabase/migrations/backfill_output_cover_photo_from_input.sql

UPDATE diffuse_project_outputs o
SET cover_photo_path = inp.file_path
FROM diffuse_project_inputs inp
WHERE inp.project_id = o.project_id
  AND inp.type = 'cover_photo'
  AND inp.deleted_at IS NULL
  AND o.deleted_at IS NULL;
