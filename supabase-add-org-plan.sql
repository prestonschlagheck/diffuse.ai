-- Add plan column to diffuse_workspaces table for enterprise plans
ALTER TABLE diffuse_workspaces
ADD COLUMN IF NOT EXISTS plan TEXT CHECK (plan IN ('enterprise_pro', 'enterprise_pro_max'));

-- Add comment for documentation
COMMENT ON COLUMN diffuse_workspaces.plan IS 'Enterprise plan tier: enterprise_pro (6 users, $100/mo) or enterprise_pro_max (12 users, $500/mo)';

