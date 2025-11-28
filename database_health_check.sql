-- ============================================
-- DATABASE HEALTH CHECK
-- ============================================

-- 1. Check admin users
SELECT 'ADMIN USERS:' as check_name;
SELECT id, role, created_at FROM admin_users;

-- 2. Check if triggers exist
SELECT 'TRIGGERS:' as check_name;
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_update_visits_count', 'trigger_update_rating');

-- 3. Check RLS policies
SELECT 'RLS POLICIES:' as check_name;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'admin_users';

-- 4. Check attractions data
SELECT 'ATTRACTIONS:' as check_name;
SELECT COUNT(*) as total_attractions FROM attractions;
SELECT name, visits_count, average_rating FROM attractions LIMIT 5;

-- 5. Check visits data
SELECT 'VISITS:' as check_name;
SELECT COUNT(*) as total_visits FROM visits;

-- 6. Check reviews data
SELECT 'REVIEWS:' as check_name;
SELECT COUNT(*) as total_reviews FROM reviews;

-- 7. Check travel plans
SELECT 'TRAVEL PLANS:' as check_name;
SELECT COUNT(*) as total_travel_plans FROM travel_plans;

-- 8. Check foreign key constraints
SELECT 'FOREIGN KEYS:' as check_name;
SELECT tc.constraint_name, tc.table_name, kcu.column_name, 
       ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'admin_users' AND tc.constraint_type = 'FOREIGN KEY';
