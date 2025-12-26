-- ==================================================
-- OPERATIONAL INTELLIGENCE ANALYTICS
-- ==================================================

CREATE OR REPLACE FUNCTION get_operational_insights()
RETURNS JSON AS $$
DECLARE
    lead_time_data JSON;
    revenue_data JSON;
    discipline_data JSON;
    traffic_data JSON;
BEGIN
    -- 1. PLANNING HORIZON (Lead Time)
    -- Calculate days between booking (created_at) and trip start (start_date)
    SELECT json_agg(t) INTO lead_time_data FROM (
        SELECT 
            CASE 
                WHEN (start_date::date - created_at::date) < 7 THEN 'Last Minute (< 1 wk)'
                WHEN (start_date::date - created_at::date) BETWEEN 7 AND 30 THEN 'Short Term (1-4 wks)'
                WHEN (start_date::date - created_at::date) BETWEEN 31 AND 90 THEN 'Medium Term (1-3 mos)'
                ELSE 'Long Term (> 3 mos)'
            END as category,
            COUNT(*) as count
        FROM completed_trips
        WHERE start_date IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
    ) t;

    -- 2. DISTRICT ECONOMY (Total Revenue)
    -- Sum of budget_actual (or budget_planned if actual is null) by district
    SELECT json_agg(t) INTO revenue_data FROM (
        SELECT 
            d.name as district,
            SUM(COALESCE(ct.budget_actual, ct.budget_planned, 0)) as total_revenue
        FROM completed_trips ct
        JOIN districts d ON d.id = ct.district_id
        GROUP BY d.name
        ORDER BY total_revenue DESC
        LIMIT 5
    ) t;

    -- 3. BUDGET DISCIPLINE (Deviation %)
    -- (Actual - Planned) / Planned * 100
    SELECT json_agg(t) INTO discipline_data FROM (
        SELECT 
            d.name as district,
            ROUND(AVG(
                CASE 
                    WHEN ct.budget_planned > 0 
                    THEN ((ct.budget_actual - ct.budget_planned) / ct.budget_planned) * 100 
                    ELSE 0 
                END
            )::numeric, 1) as deviation_percent
        FROM completed_trips ct
        JOIN districts d ON d.id = ct.district_id
        WHERE ct.budget_actual IS NOT NULL AND ct.budget_planned IS NOT NULL
        GROUP BY d.name
        HAVING COUNT(*) > 0
        ORDER BY deviation_percent DESC
        LIMIT 5
    ) t;

    -- 4. TRAFFIC PATTERNS (Day of Week)
    SELECT json_agg(t) INTO traffic_data FROM (
        SELECT 
            TO_CHAR(start_date, 'Dy') as day_name,
            COUNT(*) as visits,
            EXTRACT(ISODOW FROM start_date) as dow
        FROM completed_trips
        WHERE start_date IS NOT NULL
        GROUP BY day_name, dow
        ORDER BY dow ASC
    ) t;

    RETURN json_build_object(
        'lead_time', COALESCE(lead_time_data, '[]'::json),
        'revenue', COALESCE(revenue_data, '[]'::json),
        'discipline', COALESCE(discipline_data, '[]'::json),
        'traffic', COALESCE(traffic_data, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_operational_insights TO anon, authenticated, service_role;
