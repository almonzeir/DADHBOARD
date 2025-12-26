-- ==========================================
-- MAIKEDAH CHART REPAIR SCRIPT
-- Run this in Supabase SQL Editor to populate all charts
-- ==========================================

-- 1. First, check if completed_trips table exists and has data
SELECT 
    'completed_trips' as "Table",
    COUNT(*) as "Row Count"
FROM completed_trips;

-- 2. KPI Stats Function
CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'trips', COUNT(*),
            'tourists', COALESCE(SUM(no_travelers), 0),
            'budget', COALESCE(ROUND(AVG(budget_actual), 0), 0),
            'rating', COALESCE(ROUND(AVG(overall_rating)::numeric, 1), 0),
            'duration', COALESCE(ROUND(AVG(EXTRACT(day FROM (end_date::timestamp - start_date::timestamp))), 0), 0),
            'top_destination', COALESCE(
                (SELECT d.name FROM districts d 
                 JOIN completed_trips ct ON ct.district_id = d.id 
                 GROUP BY d.name ORDER BY COUNT(*) DESC LIMIT 1),
                'N/A'
            ),
            'top_visits', COALESCE(
                (SELECT COUNT(*)::int FROM completed_trips 
                 WHERE district_id = (
                     SELECT district_id FROM completed_trips 
                     GROUP BY district_id ORDER BY COUNT(*) DESC LIMIT 1
                 )),
                0
            )
        )
        FROM completed_trips
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trend Chart (Trips/Tourists over time)
CREATE OR REPLACE FUNCTION get_trip_trends()
RETURNS TABLE (name TEXT, trips BIGINT, tourists BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(DATE_TRUNC('month', ct.created_at), 'Mon')::TEXT as name,
        COUNT(*)::BIGINT as trips,
        COALESCE(SUM(ct.no_travelers), 0)::BIGINT as tourists
    FROM completed_trips ct
    WHERE ct.created_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', ct.created_at)
    ORDER BY DATE_TRUNC('month', ct.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Popular Places Chart
CREATE OR REPLACE FUNCTION get_places_chart()
RETURNS TABLE (name TEXT, visits BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name::TEXT,
        COUNT(*)::BIGINT as visits
    FROM completed_trips ct
    CROSS JOIN LATERAL jsonb_array_elements(ct.attractions) as place_obj
    JOIN places p ON p.id::text = (place_obj ->> 'id')
    GROUP BY p.name
    ORDER BY visits DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. District Stats
CREATE OR REPLACE FUNCTION get_district_stats()
RETURNS TABLE (district_name TEXT, visit_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.name::TEXT as district_name,
        COUNT(*)::BIGINT as visit_count
    FROM completed_trips ct
    JOIN districts d ON d.id = ct.district_id
    GROUP BY d.name
    ORDER BY visit_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Budget Scatter (Spending vs Duration)
CREATE OR REPLACE FUNCTION get_budget_scatter()
RETURNS TABLE (days INT, budget DECIMAL, segment TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(day FROM (end_date::timestamp - start_date::timestamp))::INT as days,
        COALESCE(budget_planned, 0)::DECIMAL as budget,
        COALESCE(traveler_type, 'Unknown')::TEXT as segment
    FROM completed_trips
    WHERE start_date IS NOT NULL AND end_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Financial Analytics
CREATE OR REPLACE FUNCTION get_financial_analytics()
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'avg_planned', COALESCE(ROUND(AVG(budget_planned), 0), 0),
            'avg_actual', COALESCE(ROUND(AVG(budget_actual), 0), 0),
            'deviation', COALESCE(
                ROUND(
                    CASE WHEN AVG(budget_planned) > 0 
                    THEN ((AVG(budget_actual) - AVG(budget_planned)) / AVG(budget_planned) * 100)
                    ELSE 0 END
                , 1), 0
            ),
            'total_revenue_estimated', COALESCE(SUM(budget_actual), 0)
        )
        FROM completed_trips
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Top Interests (Psychographics)
CREATE OR REPLACE FUNCTION get_top_interests()
RETURNS TABLE (name TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        interest::TEXT as name,
        COUNT(*)::BIGINT as count
    FROM completed_trips,
    jsonb_array_elements_text(interests) as interest
    GROUP BY interest
    ORDER BY count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Budget Tiers
CREATE OR REPLACE FUNCTION get_budget_tiers()
RETURNS TABLE (tier TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN budget_planned < 500 THEN 'Budget (<500)'
            WHEN budget_planned BETWEEN 500 AND 2000 THEN 'Standard'
            ELSE 'Luxury (>2000)'
        END::TEXT as tier,
        COUNT(*)::BIGINT as count
    FROM completed_trips
    WHERE budget_planned IS NOT NULL
    GROUP BY tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trip Pace
CREATE OR REPLACE FUNCTION get_trip_pace()
RETURNS TABLE (pace_type TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN jsonb_array_length(attractions) <= 3 THEN 'Relaxed (1-3)'
            WHEN jsonb_array_length(attractions) <= 6 THEN 'Moderate (4-6)'
            ELSE 'Intense (7+)'
        END::TEXT as pace_type,
        COUNT(*)::BIGINT as count
    FROM completed_trips
    WHERE attractions IS NOT NULL
    GROUP BY pace_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Advanced Stats (Deep Dive)
CREATE OR REPLACE FUNCTION get_advanced_stats()
RETURNS JSON AS $$
DECLARE
    budget_dist JSON;
    spending_by_type JSON;
    completion_stats JSON;
BEGIN
    SELECT json_agg(t) INTO budget_dist FROM (
        SELECT 
            CASE 
                WHEN budget_planned < 500 THEN 'Budget (<500)'
                WHEN budget_planned BETWEEN 500 AND 2000 THEN 'Standard'
                ELSE 'Luxury (>2000)'
            END as category,
            COUNT(*) as count
        FROM completed_trips
        WHERE budget_planned IS NOT NULL
        GROUP BY 1
    ) t;

    SELECT json_agg(t) INTO spending_by_type FROM (
        SELECT 
            COALESCE(traveler_type, 'Unknown') as type,
            ROUND(AVG(budget_planned), 0) as avg_spend
        FROM completed_trips
        GROUP BY traveler_type
        ORDER BY avg_spend DESC
    ) t;

    SELECT json_build_object(
        'avg_completion', COALESCE(ROUND(AVG(completion_percentage)::numeric, 1), 0),
        'total_skipped', COALESCE(SUM(places_skipped), 0)
    ) INTO completion_stats FROM completed_trips;

    RETURN json_build_object(
        'budget_distribution', COALESCE(budget_dist, '[]'::json),
        'spending_power', COALESCE(spending_by_type, '[]'::json),
        'intensity', completion_stats
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to all functions
GRANT EXECUTE ON FUNCTION get_dashboard_kpis TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_trip_trends TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_places_chart TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_district_stats TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_budget_scatter TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_financial_analytics TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_top_interests TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_budget_tiers TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_trip_pace TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_advanced_stats TO anon, authenticated, service_role;

-- Verify the functions work
SELECT 'KPIs' as "Test", get_dashboard_kpis() as "Result";
SELECT 'Financials' as "Test", get_financial_analytics() as "Result";
SELECT 'Advanced' as "Test", get_advanced_stats() as "Result";
