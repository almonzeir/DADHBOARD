-- Create a secure function to get admin users with their emails
CREATE OR REPLACE FUNCTION get_admin_users_with_emails()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  created_at timestamptz
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    u.email,
    au.role,
    au.created_at
  FROM admin_users au
  LEFT JOIN auth.users u ON au.id = u.id
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_users_with_emails() TO authenticated;
