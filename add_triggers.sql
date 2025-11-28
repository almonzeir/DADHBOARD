-- 1. Trigger to update visits_count in attractions table
CREATE OR REPLACE FUNCTION update_attraction_visits_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE attractions
        SET visits_count = visits_count + 1
        WHERE id = NEW.attraction_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE attractions
        SET visits_count = visits_count - 1
        WHERE id = OLD.attraction_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_visits_count
AFTER INSERT OR DELETE ON visits
FOR EACH ROW
EXECUTE FUNCTION update_attraction_visits_count();

-- 2. Trigger to update average_rating in attractions table
CREATE OR REPLACE FUNCTION update_attraction_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE attractions
    SET average_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE attraction_id = NEW.attraction_id
    )
    WHERE id = NEW.attraction_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_attraction_rating();

-- 3. Recalculate existing data to ensure current consistency
UPDATE attractions a
SET visits_count = (
    SELECT COUNT(*) 
    FROM visits v 
    WHERE v.attraction_id = a.id
);

UPDATE attractions a
SET average_rating = (
    SELECT COALESCE(AVG(r.rating), 0)
    FROM reviews r
    WHERE r.attraction_id = a.id
);
