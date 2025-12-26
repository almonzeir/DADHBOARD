-- ==================================================
-- MASTER RESTORATION & GROWTH SCRIPT
-- ==================================================

-- 1. PSYCHOGRAPHIC ENGINE
CREATE OR REPLACE FUNCTION get_safe_insights()
RETURNS JSON AS $$
DECLARE
    traveler_dna JSON;
    value_matrix JSON;
    interest_map JSON;
BEGIN
    SELECT json_agg(t) INTO traveler_dna FROM (
        SELECT COALESCE(traveler_type, 'Unspecified') as name, COUNT(*) as value
        FROM completed_trips GROUP BY traveler_type
    ) t;

    SELECT json_agg(t) INTO value_matrix FROM (
        SELECT budget_planned as x, overall_rating as y, COALESCE(title, 'Trip') as label
        FROM completed_trips WHERE budget_planned IS NOT NULL AND overall_rating IS NOT NULL
    ) t;

    SELECT json_agg(t) INTO interest_map FROM (
        SELECT value as name, COUNT(*) as value
        FROM completed_trips, jsonb_array_elements_text(COALESCE(interests, '[]'::jsonb)) as value
        GROUP BY value ORDER BY value DESC LIMIT 6
    ) t;

    RETURN json_build_object(
        'traveler_dna', COALESCE(traveler_dna, '[]'::json),
        'value_matrix', COALESCE(value_matrix, '[]'::json),
        'interest_map', COALESCE(interest_map, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. OPERATIONAL ENGINE
CREATE OR REPLACE FUNCTION get_operational_insights()
RETURNS JSON AS $$
DECLARE
    lead_time_stats JSON;
    district_revenue JSON;
    budget_discipline JSON;
    weekly_traffic JSON;
BEGIN
    SELECT json_agg(t) INTO lead_time_stats FROM (
        SELECT 
            CASE 
                WHEN (start_date - created_at::date) <= 3 THEN 'Last Minute (<3 Days)'
                WHEN (start_date - created_at::date) BETWEEN 4 AND 14 THEN 'Standard (1-2 Weeks)'
                ELSE 'Planned (>2 Weeks)'
            END as category, COUNT(*) as count
        FROM completed_trips GROUP BY category
    ) t;

    SELECT json_agg(t) INTO district_revenue FROM (
        SELECT COALESCE(d.name, 'Unknown') as district, SUM(COALESCE(ct.budget_actual, 0)) as total_revenue
        FROM completed_trips ct LEFT JOIN districts d ON d.id = ct.district_id
        GROUP BY d.name HAVING SUM(COALESCE(ct.budget_actual, 0)) > 0
        ORDER BY total_revenue DESC LIMIT 5
    ) t;

    SELECT json_agg(t) INTO budget_discipline FROM (
        SELECT COALESCE(d.name, 'Unknown') as district,
            ROUND(AVG(CASE WHEN budget_planned > 0 THEN ((budget_actual - budget_planned) / budget_planned) * 100 ELSE 0 END), 1) as deviation_percent
        FROM completed_trips ct LEFT JOIN districts d ON d.id = ct.district_id GROUP BY d.name
    ) t;

    SELECT json_agg(t) INTO weekly_traffic FROM (
        SELECT TRIM(TO_CHAR(start_date, 'Dy')) as day_name, COUNT(*) as visits, EXTRACT(ISODOW FROM start_date) as day_num
        FROM completed_trips GROUP BY day_name, day_num ORDER BY day_num ASC
    ) t;

    RETURN json_build_object(
        'lead_time', COALESCE(lead_time_stats, '[]'::json),
        'revenue', COALESCE(district_revenue, '[]'::json),
        'discipline', COALESCE(budget_discipline, '[]'::json),
        'traffic', COALESCE(weekly_traffic, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. BEHAVIORAL ENGINE
CREATE OR REPLACE FUNCTION get_missing_insights()
RETURNS JSON AS $$
DECLARE
    planning_realism JSON;
    intensity_gauge JSON;
BEGIN
    SELECT json_agg(t) INTO planning_realism FROM (
        SELECT 
            CASE 
                WHEN (budget_actual - budget_planned) > 200 THEN 'Under-Budgeted (Shock)'
                WHEN (budget_actual - budget_planned) < -200 THEN 'Over-Budgeted (Safe)'
                ELSE 'Realistic (±RM200)'
            END as status, COUNT(*) as count
        FROM completed_trips WHERE budget_planned IS NOT NULL AND budget_actual IS NOT NULL GROUP BY status
    ) t;

    SELECT json_build_object(
        'avg_completion', ROUND(AVG(COALESCE(completion_percentage, 0)), 1),
        'total_skipped', SUM(COALESCE(places_skipped, 0))
    ) INTO intensity_gauge FROM completed_trips;

    RETURN json_build_object('realism', COALESCE(planning_realism, '[]'::json), 'intensity', COALESCE(intensity_gauge, '{}'::json));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. GROWTH ENGINE (NEW)
CREATE OR REPLACE FUNCTION get_growth_metrics()
RETURNS JSON AS $$
DECLARE
    revenue_momentum JSON;
    traffic_matrix JSON;
    quality_trend JSON;
BEGIN
    -- Revenue Momentum
    SELECT json_agg(t) INTO revenue_momentum FROM (
        SELECT 
            to_char(end_date, 'Mon DD') as date,
            SUM(budget_actual) OVER (ORDER BY end_date) as cumulative_revenue
        FROM completed_trips
        WHERE budget_actual IS NOT NULL
        ORDER BY end_date ASC
    ) t;

    -- Traffic Heatmap
    SELECT json_agg(t) INTO traffic_matrix FROM (
        SELECT 
            TRIM(to_char(created_at, 'Dy')) as day,
            EXTRACT(HOUR FROM created_at) as hour,
            COUNT(*) as intensity
        FROM completed_trips
        GROUP BY day, hour
        ORDER BY intensity DESC
        LIMIT 20
    ) t;

    -- Quality Trend
    SELECT json_agg(t) INTO quality_trend FROM (
        SELECT 
            to_char(end_date, 'Mon DD') as date,
            ROUND(AVG(overall_rating), 1) as rating
        FROM completed_trips
        WHERE overall_rating IS NOT NULL
        GROUP BY date, end_date
        ORDER BY end_date ASC
    ) t;

    RETURN json_build_object(
        'momentum', COALESCE(revenue_momentum, '[]'::json),
        'heatmap', COALESCE(traffic_matrix, '[]'::json),
        'quality', COALESCE(quality_trend, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. GLOBAL REACH (Nationality Column)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='completed_trips' AND column_name='origin_country') THEN 
        ALTER TABLE completed_trips ADD COLUMN origin_country TEXT;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION get_nationality_stats()
RETURNS JSON AS $$
DECLARE
    nationality_data JSON;
BEGIN
    SELECT json_agg(t) INTO nationality_data FROM (
        SELECT origin_country as country, COUNT(*) as visitors
        FROM completed_trips WHERE origin_country IS NOT NULL
        GROUP BY origin_country ORDER BY visitors DESC
    ) t;
    RETURN COALESCE(nationality_data, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_trips_district ON completed_trips(district_id);
CREATE INDEX IF NOT EXISTS idx_trips_budget ON completed_trips(budget_planned);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON completed_trips(start_date, end_date);

-- GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION get_safe_insights TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_operational_insights TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_missing_insights TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_nationality_stats TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_growth_metrics TO anon, authenticated, service_role;
