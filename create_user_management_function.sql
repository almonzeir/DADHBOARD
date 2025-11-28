-- Function to get admin users with their emails from auth.users
-- This needs to be run in Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_admin_users_with_emails()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
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
    au.role,
    au.created_at
  FROM admin_users au
  LEFT JOIN auth.users u ON u.id = au.id;
END;
$$;
