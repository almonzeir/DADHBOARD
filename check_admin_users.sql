-- Check what columns exist in admin_users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_users';

-- Check what data is actually in there
SELECT * FROM admin_users;
