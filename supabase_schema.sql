-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. LOOKUP TABLES (Static data managed by Admins)

-- DISTRICTS (e.g., Langkawi, Kota Setar)
create table if not exists districts (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  name_ms text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CATEGORIES (e.g., Nature, Heritage)
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist for categories
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'categories' and column_name = 'name_ms') then
        alter table categories add column name_ms text;
    end if;
end $$;

-- 2. CORE INVENTORY

-- ATTRACTIONS (The places tourists visit)
create table if not exists attractions (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_ms text,
  description text,
  location text,
  image_url text,
  district_id uuid references districts(id),
  category_id uuid references categories(id),
  average_rating numeric(3, 2) default 0.00,
  visits_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist (in case table already existed without them)
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name = 'attractions' and column_name = 'category_id') then
        alter table attractions add column category_id uuid references categories(id);
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'attractions' and column_name = 'district_id') then
        alter table attractions add column district_id uuid references districts(id);
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'attractions' and column_name = 'visits_count') then
        alter table attractions add column visits_count integer default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'attractions' and column_name = 'average_rating') then
        alter table attractions add column average_rating numeric(3, 2) default 0.00;
    end if;
end $$;

-- 3. USER DATA (From Mobile App)

-- TOURISTS (Profiles linked to Supabase Auth)
create table if not exists tourists (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  origin_country text, -- To track "International vs Local"
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRIPS (Itineraries created by tourists)
-- Renamed to travel_plans to match existing table
create table if not exists travel_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references tourists(id) on delete cascade not null, -- references tourists(id) which links to auth.users
  title text,
  start_date date,
  end_date date,
  status text default 'planned', -- planned, active, completed
  budget numeric(10, 2),
  pax integer default 1,
  visitor_segment text, -- e.g., Family, Solo, Couple
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- VISITS (Actual check-ins or planned visits within a trip)
create table if not exists visits (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references travel_plans(id) on delete cascade not null,
  attraction_id uuid references attractions(id) not null,
  visit_date timestamp with time zone,
  status text default 'planned', -- planned, visited
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS (Feedback from tourists)
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  tourist_id uuid references tourists(id) on delete cascade not null,
  attraction_id uuid references attractions(id) not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ADMIN & ANALYTICS

-- ADMIN USERS (Dashboard access)
create table if not exists admin_users (
  id uuid references auth.users on delete cascade not null primary key,
  role text default 'editor', -- admin, editor, viewer
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GENERATED REPORTS (Metadata for PDF downloads)
create table if not exists generated_reports (
  id uuid default uuid_generate_v4() primary key,
  title text,
  file_path text,
  generated_by uuid references admin_users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. SAMPLE DATA INSERTION (For testing)
-- This data is "Real" in the DB, just inserted manually so you can see the dashboard working.

-- 5. SAMPLE DATA INSERTION (For testing)
-- This data is "Real" in the DB, just inserted manually so you can see the dashboard working.

-- Insert Districts (using WHERE NOT EXISTS to avoid errors if no unique constraint)
insert into districts (name, name_ms)
select d.name, d.name
from (values 
  ('Langkawi'), 
  ('Kota Setar'), 
  ('Kuala Muda'), 
  ('Kubang Pasu')
) as d(name)
where not exists (select 1 from districts where name = d.name);

-- Insert Categories
insert into categories (name, name_ms)
select c.name, c.name
from (values 
  ('Nature & Adventure'), 
  ('Culture & Heritage'), 
  ('Shopping & Dining'), 
  ('Beach & Relaxation')
) as c(name)
where not exists (select 1 from categories where name = c.name);

-- Insert Attractions
insert into attractions (name, name_ms, district_id, category_id, visits_count, average_rating) 
select 'Langkawi Sky Bridge', 'Langkawi Sky Bridge', id, (select id from categories where name = 'Nature & Adventure' limit 1), 2145, 4.8 
from districts where name = 'Langkawi'
and not exists (select 1 from attractions where name = 'Langkawi Sky Bridge')
union all
select 'Underwater World', 'Underwater World', id, (select id from categories where name = 'Nature & Adventure' limit 1), 1892, 4.5
from districts where name = 'Langkawi'
and not exists (select 1 from attractions where name = 'Underwater World')
union all
select 'Gunung Jerai', 'Gunung Jerai', id, (select id from categories where name = 'Nature & Adventure' limit 1), 1654, 4.6
from districts where name = 'Kuala Muda'
and not exists (select 1 from attractions where name = 'Gunung Jerai')
union all
select 'Paddy Museum', 'Paddy Museum', id, (select id from categories where name = 'Culture & Heritage' limit 1), 1287, 4.4
from districts where name = 'Kota Setar'
and not exists (select 1 from attractions where name = 'Paddy Museum')
union all
select 'Alor Setar Tower', 'Alor Setar Tower', id, (select id from categories where name = 'Shopping & Dining' limit 1), 1156, 4.3
from districts where name = 'Kota Setar'
and not exists (select 1 from attractions where name = 'Alor Setar Tower');

-- Insert Sample Travel Plans (Trips)
-- We need a valid user_id. Since we don't know your user ID, we'll skip this or you can uncomment and replace UUID.
-- insert into travel_plans (user_id, title, status, budget) values ('YOUR_USER_UUID', 'Trip to Langkawi', 'active', 1500);
