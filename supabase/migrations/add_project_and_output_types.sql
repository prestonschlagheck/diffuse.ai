-- Add project_type column to diffuse_projects
-- This distinguishes between regular projects and advertisements
ALTER TABLE diffuse_projects 
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'project' 
CHECK (project_type IN ('project', 'advertisement'));

-- Add output_type column to diffuse_project_outputs
-- This distinguishes between article outputs and ad outputs
ALTER TABLE diffuse_project_outputs 
ADD COLUMN IF NOT EXISTS output_type TEXT DEFAULT 'article' 
CHECK (output_type IN ('article', 'ad'));

-- Create index for faster filtering by project_type
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON diffuse_projects(project_type);

-- Create index for faster filtering by output_type
CREATE INDEX IF NOT EXISTS idx_outputs_output_type ON diffuse_project_outputs(output_type);
