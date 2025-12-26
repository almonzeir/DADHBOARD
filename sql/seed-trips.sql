-- ==========================================
-- SEED DATA FOR COMPLETED_TRIPS
-- Run this in Supabase SQL Editor
-- ==========================================

-- First, check what columns exist in completed_trips
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'completed_trips'
ORDER BY ordinal_position;

-- Insert 7 sample rows with ALL required fields including title
INSERT INTO completed_trips (
    title,
    start_date, 
    end_date, 
    no_travelers, 
    budget_planned, 
    budget_actual, 
    completion_percentage, 
    places_skipped, 
    overall_rating, 
    traveler_type, 
    interests, 
    district_id
)
VALUES 
    ('Langkawi Family Adventure', '2025-10-15', '2025-10-20', 4, 2500, 2800, 95, 1, 4.8, 'Family', '["Beach", "Nature", "Food"]', (SELECT id FROM districts ORDER BY RANDOM() LIMIT 1)),
    ('Solo Backpacker Trip', '2025-09-05', '2025-09-08', 1, 800, 750, 100, 0, 4.5, 'Solo', '["Adventure", "Culture", "Budget"]', (SELECT id FROM districts ORDER BY RANDOM() LIMIT 1)),
    ('Honeymoon Getaway', '2025-11-01', '2025-11-05', 2, 5000, 5500, 90, 2, 4.9, 'Couple', '["Luxury", "Beach", "Romance"]', (SELECT id FROM districts ORDER BY RANDOM() LIMIT 1)),
    ('Business Conference Trip', '2025-08-20', '2025-08-22', 1, 1500, 1450, 80, 3, 4.0, 'Business', '["City", "Food", "Networking"]', (SELECT id FROM districts ORDER BY RANDOM() LIMIT 1)),
    ('Friends Reunion Tour', '2025-10-28', '2025-11-02', 6, 3500, 4200, 85, 2, 4.6, 'Friends', '["Party", "Food", "Adventure"]', (SELECT id FROM districts ORDER BY RANDOM() LIMIT 1)),
    ('Cultural Heritage Exploration', '2025-09-15', '2025-09-18', 3, 1200, 1100, 100, 0, 4.7, 'Family', '["Culture", "History", "Art"]', (SELECT id FROM districts ORDER BY RANDOM() LIMIT 1)),
    ('Eco Tourism Adventure', '2025-11-10', '2025-11-14', 2, 1800, 1900, 92, 1, 4.4, 'Couple', '["Nature", "Eco", "Hiking"]', (SELECT id FROM districts ORDER BY RANDOM() LIMIT 1));

-- Verify the data was inserted
SELECT 
    title, 
    traveler_type, 
    budget_planned, 
    budget_actual, 
    completion_percentage,
    overall_rating
FROM completed_trips
ORDER BY created_at DESC
LIMIT 10;
