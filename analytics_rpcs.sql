-- Analytics RPCs for MaiKedah Admin

-- 1. get_analytics_kpis
CREATE OR REPLACE FUNCTION get_analytics_kpis()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_tourists', COALESCE(SUM(no_traveler), 0),
        'total_trips', COUNT(*),
        'total_revenue', COALESCE(SUM(CASE WHEN status = 'completed' THEN budget::numeric ELSE 0 END), 0),
        'avg_rating', (SELECT COALESCE(AVG(rating), 0) FROM reviews),
        'completed_trips', COUNT(*) FILTER (WHERE status = 'completed'),
        'active_trips', COUNT(*) FILTER (WHERE status = 'active')
    ) INTO result
    FROM travel_plans;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 2. get_monthly_trip_trends
CREATE OR REPLACE FUNCTION get_monthly_trip_trends()
RETURNS TABLE (
    month TEXT,
    trips BIGINT,
    tourists BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_char(created_at, 'Mon YYYY') as month,
        COUNT(*) as trips,
        SUM(no_traveler)::BIGINT as tourists
    FROM travel_plans
    GROUP BY 1, date_trunc('month', created_at)
    ORDER BY date_trunc('month', created_at) ASC;
END;
$$ LANGUAGE plpgsql;

-- 3. get_visitor_segments
CREATE OR REPLACE FUNCTION get_visitor_segments()
RETURNS TABLE (
    segment TEXT,
    count BIGINT,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH segment_counts AS (
        SELECT 
            COALESCE(visitor_segment, 'Other') as s,
            COUNT(*) as c
        FROM travel_plans
        GROUP BY 1
    ),
    total AS (
        SELECT SUM(c) as t FROM segment_counts
    )
    SELECT 
        s as segment,
        c as count,
        ROUND((c::NUMERIC / total.t::NUMERIC) * 100, 1) as percentage
    FROM segment_counts, total
    ORDER BY c DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. get_popular_places_analytics
CREATE OR REPLACE FUNCTION get_popular_places_analytics()
RETURNS TABLE (
    place_name TEXT,
    visit_count BIGINT,
    avg_rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        name as place_name,
        popularity_score::BIGINT as visit_count,
        rating::NUMERIC as avg_rating
    FROM places
    WHERE is_active = true
    ORDER BY popularity_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
