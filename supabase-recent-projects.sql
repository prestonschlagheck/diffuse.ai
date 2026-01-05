-- Create table for storing user's recent projects
CREATE TABLE IF NOT EXISTS user_recent_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES diffuse_projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Create index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_user_recent_projects_user_id ON user_recent_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recent_projects_viewed_at ON user_recent_projects(viewed_at DESC);

-- Enable RLS
ALTER TABLE user_recent_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own recent projects
CREATE POLICY "Users can view their own recent projects"
  ON user_recent_projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent projects"
  ON user_recent_projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recent projects"
  ON user_recent_projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent projects"
  ON user_recent_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to upsert a recent project and keep only the 10 most recent
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

