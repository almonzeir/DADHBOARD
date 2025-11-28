-- ============================================
-- SIMPLIFIED ROLE-BASED ACCESS CONTROL
-- Only 2 Roles: Admin & Analytics Only
-- ============================================

-- 1. Update admin_users table schema
-- Role can be: 'admin' or 'analytics_only'
ALTER TABLE admin_users 
DROP COLUMN IF EXISTS is_super_admin;

-- Ensure role column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' AND column_name = 'role'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN role text DEFAULT 'analytics_only';
    END IF;
END $$;

-- 2. Set the main admin (admin@email) as 'admin' role
-- Replace REPLACE_WITH_ADMIN_EMAIL_UID with actual UID after creating user
UPDATE admin_users 
SET role = 'admin'
WHERE id = 'REPLACE_WITH_ADMIN_EMAIL_UID';

-- 3. Create function to check if user is admin (can manage users)
CREATE OR REPLACE FUNCTION can_manage_users(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role
    FROM admin_users 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enable Row Level Security on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Super admin can manage users" ON admin_users;
DROP POLICY IF EXISTS "All admins can view users" ON admin_users;

-- 6. Create RLS policy: Only admin role can INSERT/UPDATE/DELETE
CREATE POLICY "Only admin can manage users"
ON admin_users
FOR ALL
USING (
    can_manage_users(auth.uid())
);

-- 7. Create RLS policy: All authenticated users can view admin_users
CREATE POLICY "All authenticated can view users"
ON admin_users
FOR SELECT
USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check current admin users and their roles
SELECT id, role, created_at 
FROM admin_users;

-- Test if a user can manage users (replace with actual UID)
-- SELECT can_manage_users('YOUR_UID_HERE');

-- Get user role (replace with actual UID)
-- SELECT get_user_role('YOUR_UID_HERE');
