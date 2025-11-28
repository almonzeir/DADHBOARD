-- Migration: Add approval system to admin_users table
-- Run this in Supabase SQL Editor

-- Add new columns to admin_users table
ALTER TABLE admin_users 
  ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS requested_at timestamptz DEFAULT now();

-- Update existing admin users to be approved (backward compatibility)
UPDATE admin_users 
SET is_approved = true 
WHERE is_approved IS NULL OR is_approved = false;

-- Update the get_admin_users_with_emails function to include new fields
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

-- Function to approve a user
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

-- Function to reject a user (delete from admin_users only, auth.users cleanup handled by cascade)
CREATE OR REPLACE FUNCTION reject_admin_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM admin_users WHERE id = user_id;
END;
$$;
