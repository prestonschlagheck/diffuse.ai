-- Add walkthrough_dismissed column to user_profiles
-- When true, the walkthrough will not auto-show on dashboard load
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS walkthrough_dismissed BOOLEAN DEFAULT false;
