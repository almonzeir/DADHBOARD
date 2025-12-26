-- ==================================================
-- 1. UPGRADE TABLE (Add Age Column)
-- ==================================================
ALTER TABLE completed_trips 
ADD COLUMN IF NOT EXISTS traveler_age INTEGER;

-- ==================================================
-- 2. POPULATE DATA (Assign Ages to your 7 Rows)
-- ==================================================
-- Mix of ages: Gen Z, Millennials, Gen X
UPDATE completed_trips SET traveler_age = 22 WHERE id IN (SELECT id FROM completed_trips ORDER BY created_at LIMIT 2); -- 18-24
UPDATE completed_trips SET traveler_age = 29 WHERE id IN (SELECT id FROM completed_trips ORDER BY created_at OFFSET 2 LIMIT 2); -- 25-34
UPDATE completed_trips SET traveler_age = 38 WHERE id IN (SELECT id FROM completed_trips ORDER BY created_at OFFSET 4 LIMIT 2); -- 35-44
UPDATE completed_trips SET traveler_age = 52 WHERE id IN (SELECT id FROM completed_trips ORDER BY created_at OFFSET 6 LIMIT 1); -- 45+

-- ==================================================
-- 3. CREATE ANALYTICS FUNCTION
-- ==================================================
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS JSON AS $$
DECLARE
    age_stats JSON;
    completion_stats JSON;
BEGIN
    -- 1. AGE DEMOGRAPHICS
    SELECT json_agg(t) INTO age_stats FROM (
        SELECT 
            CASE 
                WHEN traveler_age BETWEEN 18 AND 24 THEN '18-24'
                WHEN traveler_age BETWEEN 25 AND 34 THEN '25-34'
                WHEN traveler_age BETWEEN 35 AND 44 THEN '35-44'
                ELSE '45+'
            END as range,
            COUNT(*) as count
        FROM completed_trips
        WHERE traveler_age IS NOT NULL
        GROUP BY range
        ORDER BY range
    ) t;

    -- 2. COMPLETION RATE (Based on completion_percentage)
    -- Assuming completion_percentage exists (0-100)
    SELECT json_agg(t) INTO completion_stats FROM (
        SELECT 
            CASE 
                WHEN completion_percentage >= 100 THEN 'Perfect (100%)'
                WHEN completion_percentage >= 80 THEN 'High (80-99%)'
                WHEN completion_percentage >= 50 THEN 'Medium (50-79%)'
                ELSE 'Low (<50%)'
            END as status,
            COUNT(*) as count
        FROM completed_trips
        WHERE completion_percentage IS NOT NULL
        GROUP BY status
        ORDER BY count DESC
    ) t;

    RETURN json_build_object(
        'ages', COALESCE(age_stats, '[]'::json),
        'completion', COALESCE(completion_stats, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_stats TO anon, authenticated, service_role;
