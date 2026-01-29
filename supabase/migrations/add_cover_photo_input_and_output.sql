-- Add 'cover_photo' to input_type enum (for advertisement cover photo inputs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'cover_photo' AND enumtypid = 'input_type'::regtype
  ) THEN
    ALTER TYPE input_type ADD VALUE 'cover_photo';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'input_type enum not found; ensure type column allows cover_photo';
END $$;

-- Add cover_photo_path to diffuse_project_outputs (stores storage path for ad cover image)
ALTER TABLE diffuse_project_outputs
ADD COLUMN IF NOT EXISTS cover_photo_path TEXT DEFAULT NULL;
