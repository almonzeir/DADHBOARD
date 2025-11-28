-- FIX: User Registration and Access Control
-- Run this in Supabase SQL Editor to fix all issues

-- Step 1: Drop existing admin_users table if it has wrong constraints
DROP TABLE IF EXISTS admin_users CASCADE;

-- Step 2: Recreate admin_users table with correct foreign key to auth.users
CREATE TABLE admin_users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text,
  role text default 'analytics_only',
  is_approved boolean default false,
  requested_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Step 3: Add your existing admin user (REPLACE WITH YOUR ACTUAL EMAIL)
-- First, find your user ID from auth.users
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID for the admin email (CHANGE THIS EMAIL TO YOURS!)
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@tourstat.my'  -- CHANGE THIS TO YOUR ACTUAL EMAIL
  LIMIT 1;
  
  -- If user exists, add them as approved admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO admin_users (id, full_name, role, is_approved, created_at)
    VALUES (admin_user_id, 'Admin User', 'admin', true, now())
    ON CONFLICT (id) DO UPDATE 
    SET is_approved = true, role = 'admin';
  END IF;
END $$;

-- Step 4: Create the function to get admin users with emails
CREATE OR REPLACE FUNCTION get_admin_users_with_emails()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  is_approved boolean,
  requested_at timestamptz,
  created_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    u.email::text,
    au.full_name,
    au.role,
    au.is_approved,
    au.requested_at,
    au.created_at
  FROM admin_users au
  LEFT JOIN auth.users u ON u.id = au.id
  ORDER BY au.is_approved ASC, au.requested_at DESC;
END;
$$;

-- Step 5: Create function to approve users
CREATE OR REPLACE FUNCTION approve_admin_user(user_id uuid, approved_role text DEFAULT 'analytics_only')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE admin_users
  SET is_approved = true,
      role = approved_role
  WHERE id = user_id;
END;
$$;

-- Step 6: Create function to reject users
CREATE OR REPLACE FUNCTION reject_admin_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM admin_users WHERE id = user_id;
END;
$$;

-- IMPORTANT: After running this, update line 27 above with YOUR actual email address!
-- Then run the script again to add yourself as an approved admin.
