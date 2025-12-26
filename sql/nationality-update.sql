-- ==================================================
-- 1. UPGRADE TABLE (Add Nationality Column)
-- ==================================================
ALTER TABLE completed_trips 
ADD COLUMN IF NOT EXISTS origin_country TEXT;

-- ==================================================
-- 2. POPULATE DATA (Assign Countries to your 7 Rows)
-- ==================================================
-- We update specific rows so you have a mix of local and international.
-- Note: This assumes IDs exist. If IDs are UUIDs, this specific WHERE clause with OFFSET/LIMIT 
-- might need adjustment depending on how rows are ordered/fetched, but for a small dataset it usually works 
-- if we use a consistent ordering. We'll use CTID or Created_At if possible, but for simplicity 
-- we will just update generally or let the user run it. 
-- Actually, standard SQL UPDATE with LIMIT/OFFSET isn't always supported directly in all dialects 
-- like this without a subquery. I'll use a safer approach using a CTE or just random assignment if specific IDs aren't known.
-- But the user provided script uses a subquery style. I will stick to their logic but ensure it's valid Postgres.

UPDATE completed_trips SET origin_country = 'Malaysia' WHERE id IN (SELECT id FROM completed_trips ORDER BY created_at LIMIT 3);
UPDATE completed_trips SET origin_country = 'Singapore' WHERE id IN (SELECT id FROM completed_trips ORDER BY created_at OFFSET 3 LIMIT 2);
UPDATE completed_trips SET origin_country = 'United Kingdom' WHERE id IN (SELECT id FROM completed_trips ORDER BY created_at OFFSET 5 LIMIT 1);
UPDATE completed_trips SET origin_country = 'Indonesia' WHERE id IN (SELECT id FROM completed_trips ORDER BY created_at OFFSET 6 LIMIT 1);

-- ==================================================
-- 3. CREATE ANALYTICS FUNCTION
-- ==================================================
CREATE OR REPLACE FUNCTION get_nationality_stats()
RETURNS JSON AS $$
DECLARE
    nationality_data JSON;
BEGIN
    SELECT json_agg(t) INTO nationality_data FROM (
        SELECT 
            origin_country as country,
            COUNT(*) as visitors
        FROM completed_trips
        WHERE origin_country IS NOT NULL
        GROUP BY origin_country
        ORDER BY visitors DESC
    ) t;

    RETURN COALESCE(nationality_data, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_nationality_stats TO anon, authenticated, service_role;
