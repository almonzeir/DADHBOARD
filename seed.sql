-- Kedah Tourism Seed Data
-- This script populates the database with realistic data for Kedah districts, attractions, and trips.

-- 1. Districts of Kedah
INSERT INTO districts (id, name, name_ms, description, created_at)
VALUES 
  ('baling', 'Baling', 'Baling', 'Known for Gunung Baling and hot springs.', NOW()),
  ('bandar-baharu', 'Bandar Baharu', 'Bandar Baharu', 'The southernmost district of Kedah.', NOW()),
  ('kota-setar', 'Kota Setar', 'Kota Setar', 'Where the state capital Alor Setar is located.', NOW()),
  ('kuala-muda', 'Kuala Muda', 'Kuala Muda', 'Home to Sungai Petani and archaeological sites.', NOW()),
  ('kubang-pasu', 'Kubang Pasu', 'Kubang Pasu', 'Bordering Thailand, home to many educational institutions.', NOW()),
  ('kulim', 'Kulim', 'Kulim', 'Industrial hub and home to Junjung Waterfalls.', NOW()),
  ('langkawi', 'Langkawi', 'Langkawi', 'The Jewel of Kedah, a world-famous archipelago.', NOW()),
  ('padang-terap', 'Padang Terap', 'Padang Terap', 'Large rural district with Pedu Lake.', NOW()),
  ('pendang', 'Pendang', 'Pendang', 'Famous for its vast paddy fields and local fruits.', NOW()),
  ('pokok-sena', 'Pokok Sena', 'Pokok Sena', 'A newer district known for its agriculture.', NOW()),
  ('sik', 'Sik', 'Sik', 'Known for its scenic mountains and Beris Lake.', NOW()),
  ('yan', 'Yan', 'Yan', 'Coastal district home to Gunung Jerai.', NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  name_ms = EXCLUDED.name_ms,
  description = EXCLUDED.description;

-- 2. Place Categories and Attractions
INSERT INTO places (id, name, name_ms, description, district_id, category, latitude, longitude, rating, popularity_score, is_active, is_hidden_gem, created_at)
VALUES 
  -- Langkawi
  ('langkawi-sky-bridge', 'Langkawi Sky Bridge', 'Jambatan Langit Langkawi', 'A curved pedestrian cable-stayed bridge in Langkawi.', 'langkawi', 'adventure', 6.3862, 99.6623, 4.8, 950, true, false, NOW()),
  ('langkawi-cable-car', 'Langkawi Cable Car (Panorama Langkawi)', 'Kereta Kabel Langkawi', 'One of the steepest cable car rides in the world.', 'langkawi', 'adventure', 6.3711, 99.6713, 4.7, 920, true, false, NOW()),
  ('kilim-geoforest-park', 'Kilim Geoforest Park', 'Taman Geoforest Kilim', 'Mangrove forests, limestone formations, and eagle watching.', 'langkawi', 'nature', 6.4054, 99.8601, 4.6, 880, true, false, NOW()),
  ('underwater-world-langkawi', 'Underwater World Langkawi', 'Underwater World Langkawi', 'One of the largest marine and fresh water aquaria in South East Asia.', 'langkawi', 'entertainment', 6.2877, 99.7286, 4.4, 850, true, false, NOW()),
  
  -- Kota Setar (Alor Setar)
  ('alor-setar-tower', 'Alor Setar Tower', 'Menara Alor Setar', 'The second tallest telecommunications tower in Malaysia.', 'kota-setar', 'historical', 6.1214, 100.3674, 4.5, 780, true, false, NOW()),
  ('zahir-mosque', 'Zahir Mosque', 'Masjid Zahir', 'One of the oldest and most beautiful mosques in Malaysia.', 'kota-setar', 'religious', 6.1197, 100.3653, 4.9, 820, true, false, NOW()),
  ('paddy-museum', 'Paddy Museum', 'Muzium Padi', 'Museum showcasing the history and technology of rice cultivation.', 'kota-setar', 'cultural', 6.1917, 100.3207, 4.3, 650, true, false, NOW()),
  ('wat-nikrodharam', 'Wat Nikrodharam', 'Wat Nikrodharam', 'A stunning Thai Buddhist temple in Alor Setar.', 'kota-setar', 'religious', 6.1256, 100.3702, 4.7, 580, true, true, NOW()),

  -- Yan
  ('gunung-jerai', 'Mount Jerai', 'Gunung Jerai', 'The highest peak in Kedah with stunning views of paddy fields.', 'yan', 'nature', 5.7872, 100.4311, 4.7, 810, true, false, NOW()),
  ('titi-hayun', 'Titi Hayun Waterfalls', 'Air Terjun Titi Hayun', 'A popular recreational park and waterfall.', 'yan', 'nature', 5.8014, 100.4125, 4.5, 540, true, false, NOW()),

  -- Kuala Muda
  ('lembah-bujang', 'Bujang Valley Archaeological Museum', 'Muzium Arkeologi Lembah Bujang', 'Historical site of an ancient Hindu-Buddhist kingdom.', 'kuala-muda', 'historical', 5.7389, 100.4144, 4.6, 620, true, false, NOW()),
  ('semeling-jetty', 'Semeling Jetty', 'Jeti Semeling', 'Gateway to the Merbok river mangrove tours.', 'kuala-muda', 'nature', 5.6833, 100.4667, 4.2, 450, true, true, NOW()),

  -- Baling
  ('gunung-baling', 'Mount Baling', 'Gunung Baling', 'Famous for its sharp limestone peak and sunrise views.', 'baling', 'adventure', 5.6789, 100.9167, 4.8, 480, true, false, NOW()),
  ('ulu-legong-hot-springs', 'Ulu Legong Hot Springs', 'Pusat Rekreasi Air Panas Ulu Legong', 'Natural hot springs open 24 hours.', 'baling', 'nature', 5.8083, 100.9333, 4.5, 590, true, false, NOW()),

  -- Sik
  ('beris-lake-vineyard', 'Beris Lake Vineyard', 'Ladang Anggur Tasik Beris', 'Vineyard by the lake, unique in Malaysia.', 'sik', 'nature', 5.9525, 100.7811, 4.1, 420, true, false, NOW()),
  ('late-night-durian-orchard', 'Sik Durian Orchard', 'Kebun Durian Sik', 'Visit during durian season for the best local varieties.', 'sik', 'food', 5.8234, 100.7456, 4.6, 380, true, true, NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  popularity_score = EXCLUDED.popularity_score,
  rating = EXCLUDED.rating;

-- 3. Mock Travel Plans (Trips)
-- We'll create a variety of trips over the last 6 months
INSERT INTO travel_plans (id, user_id, title, start_date, end_date, districts, attractions, status, created_at, budget, no_traveler, visitor_segment)
VALUES 
  -- Completed Trips
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Langkawi Adventure', '2025-11-01', '2025-11-05', '["langkawi"]', '{}', 'completed', '2025-10-15T10:00:00Z', '2500.00', 2, 'Couple'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Heritage Tour of Alor Setar', '2025-11-10', '2025-11-12', '["kota-setar"]', '{}', 'completed', '2025-11-02T14:30:00Z', '800.00', 4, 'Family'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'North Kedah Nature Escape', '2025-12-01', '2025-12-04', '["yan", "kuala-muda"]', '{}', 'completed', '2025-11-20T09:15:00Z', '1200.00', 3, 'Friends'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Baling Hiking Trip', '2025-10-20', '2025-10-21', '["baling"]', '{}', 'completed', '2025-10-10T16:00:00Z', '400.00', 5, 'Friends'),
  
  -- Active Trips (Current)
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Langkawi Getaway', '2025-12-18', '2025-12-22', '["langkawi"]', '{}', 'active', '2025-12-10T11:00:00Z', '3500.00', 2, 'Solo'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Kedah Foodie Trail', '2025-12-19', '2025-12-21', '["kota-setar", "sik"]', '{}', 'active', '2025-12-15T08:00:00Z', '950.00', 2, 'Couple'),
  
  -- Upcoming Trips
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Year End Family Trip', '2025-12-28', '2026-01-02', '["langkawi", "yan"]', '{}', 'active', '2025-12-17T12:00:00Z', '5000.00', 6, 'Family'),
  
  -- More historical data for trends
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'September Coastal Tour', '2025-09-05', '2025-09-08', '["yan", "kuala-muda"]', '{}', 'completed', '2025-08-25T10:00:00Z', '1500.00', 2, 'Couple'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'August Island Hopping', '2025-08-12', '2025-08-15', '["langkawi"]', '{}', 'completed', '2025-08-01T15:30:00Z', '3000.00', 3, 'Friends'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'July Paddy Fields Tour', '2025-07-20', '2025-07-22', '["kota-setar", "pendang"]', '{}', 'completed', '2025-07-10T09:00:00Z', '750.00', 2, 'Family'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'June Mountain Hike', '2025-06-15', '2025-06-16', '["baling", "sik"]', '{}', 'completed', '2025-06-05T14:45:00Z', '600.00', 4, 'Friends');

-- 4. Mock Reviews
INSERT INTO reviews (id, tourist_id, attraction_id, rating, comment, created_at)
VALUES 
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'langkawi-sky-bridge', 5, 'Breathtaking views! A must visit in Langkawi.', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'zahir-mosque', 5, 'Stunning architecture. Very peaceful place.', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'gunung-jerai', 4, 'A bit cloudy when I was there, but the air is so fresh!', NOW() - INTERVAL '1 week'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'lembah-bujang', 4, 'Very informative museum and impressive archaeological sites.', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'alor-setar-tower', 3, 'Nice view of the city, but the lift was a bit slow.', NOW() - INTERVAL '12 days');
