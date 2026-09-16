-- =========================================================================
-- TOURS FEATURE - SUPABASE SQL SCHEMA MIGRATION
-- Run this entire script in your Supabase SQL Editor.
-- =========================================================================

-- 1. ADD ROLE TO USERS TABLE
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'::text;

-- 2. TOURS TABLE
CREATE TABLE IF NOT EXISTS public.tours (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  short_description text NOT NULL,
  image_url text,
  location text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  duration_days integer NOT NULL,
  difficulty text NOT NULL,
  category text,
  number_of_stops integer,
  max_group_size integer NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  start_date date,
  end_date date,
  available_slots integer,
  tour_guide_id integer REFERENCES public.users(id) ON DELETE SET NULL,
  included_services jsonb,
  excluded_services jsonb,
  itinerary jsonb,
  meeting_point text,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id integer REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tour_id uuid REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  tour_date date NOT NULL,
  number_of_people integer NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  payment_status text DEFAULT 'pending', -- pending, paid, failed
  booking_status text DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  payment_method text,
  transaction_reference text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id uuid REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  user_id integer REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(booking_id) -- Prevent duplicate reviews per booking
);

-- Enable Realtime for bookings (crucial for QR flow)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END
$$;

-- 5. RLS POLICIES
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to tours and reviews
CREATE POLICY "Tours are viewable by everyone" ON public.tours FOR SELECT USING (true);
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
-- Allow frontend to view bookings via ID (used for QR code flow) 
CREATE POLICY "Bookings viewable by everyone for demo" ON public.bookings FOR SELECT USING (true);
-- Updates and inserts are handled by the Express backend which acts via a Service Key/direct DB connection, 
-- effectively bypassing RLS. We keep policies strictly to read-only for the public API.

-- 6. INSERT DEMO USERS (With dummy passwords since we don't have their plaintext)
-- We use a dummy bcrypt hash. You can still login to these by resetting their password or they are just placeholders for relationships.
INSERT INTO public.users (username, email, password, role) VALUES 
  ('Admin', 'admin@demo.com', '$2a$10$C8q.pU0Y.1rGZ8Q/b3T/n.o2J.6Cq/Lw8z3S2m3C/R5Z3q4/w2Uqy', 'admin'),
  ('Ravi Guide', 'guide1@demo.com', '$2a$10$C8q.pU0Y.1rGZ8Q/b3T/n.o2J.6Cq/Lw8z3S2m3C/R5Z3q4/w2Uqy', 'tourguide'),
  ('Priya Guide', 'guide2@demo.com', '$2a$10$C8q.pU0Y.1rGZ8Q/b3T/n.o2J.6Cq/Lw8z3S2m3C/R5Z3q4/w2Uqy', 'tourguide'),
  ('Arjun Guide', 'guide3@demo.com', '$2a$10$C8q.pU0Y.1rGZ8Q/b3T/n.o2J.6Cq/Lw8z3S2m3C/R5Z3q4/w2Uqy', 'tourguide'),
  ('Traveler One', 'traveler1@demo.com', '$2a$10$C8q.pU0Y.1rGZ8Q/b3T/n.o2J.6Cq/Lw8z3S2m3C/R5Z3q4/w2Uqy', 'user')
ON CONFLICT (email) DO NOTHING;

-- 7. DEMO TOURS
INSERT INTO public.tours (title, slug, description, short_description, image_url, location, duration_days, difficulty, number_of_stops, max_group_size, price, tour_guide_id, category, is_active, rating, review_count, itinerary, included_services) 
VALUES
('Himalayan Explorer', 'himalayan-explorer', 'Experience the raw beauty of the Himalayas. This 7-day trek covers lush green valleys and snow-capped peaks.', '7 Days in Manali', 'https://picsum.photos/seed/himalayan-explorer/800/600', 'Manali, India', 7, 'Medium', 5, 15, 14999, (SELECT id FROM public.users WHERE email='guide1@demo.com' LIMIT 1), 'Mountain', true, 4.8, 126, '[{"day":1,"title":"Arrival at Manali"},{"day":2,"title":"Trek to Vashisht"},{"day":3,"title":"Bhrigu Lake Trek"}]', '["Meals", "Guide", "Tents"]'),
('Valley of Flowers Adventure', 'valley-of-flowers', 'A vibrant trek through the Valley of Flowers in Uttarakhand, witnessing thousands of blooming alpine flowers.', '6 Days in Uttarakhand', 'https://picsum.photos/seed/valley-of-flowers/800/600', 'Uttarakhand, India', 6, 'Medium', 4, 12, 12500, (SELECT id FROM public.users WHERE email='guide2@demo.com' LIMIT 1), 'Trekking', true, 4.9, 89, '[{"day":1,"title":"Arrival at Joshimath"},{"day":2,"title":"Trek to Ghangaria"}]', '["Meals", "Guide"]'),
('Meghalaya Waterfall Escape', 'meghalaya-waterfall', 'Discover the breathtaking living root bridges, crystal clear rivers, and stunning waterfalls of Meghalaya.', '5 Days in Meghalaya', 'https://picsum.photos/seed/meghalaya-waterfall/800/600', 'Meghalaya, India', 5, 'Easy', 3, 20, 11000, (SELECT id FROM public.users WHERE email='guide3@demo.com' LIMIT 1), 'Nature', true, 4.7, 45, '[{"day":1,"title":"Shillong Sightseeing"},{"day":2,"title":"Cherrapunjee Waterfalls"}]', '["Meals", "Transport"]'),
('Ladakh Mountain Expedition', 'ladakh-expedition', 'Conquer the high-altitude passes of Ladakh, visit ancient monasteries, and camp by the Pangong Lake.', '8 Days in Ladakh', 'https://picsum.photos/seed/ladakh-expedition/800/600', 'Ladakh, India', 8, 'Hard', 7, 10, 25000, (SELECT id FROM public.users WHERE email='guide1@demo.com' LIMIT 1), 'Adventure', true, 4.9, 210, '[{"day":1,"title":"Acclimatization in Leh"},{"day":2,"title":"Nubra Valley"}]', '["Meals", "Permits", "Bikes"]'),
('Kerala Backwater Journey', 'kerala-backwater', 'Relaxing cruise through the serene backwaters of Alleppey on a traditional houseboat.', '5 Days in Kerala', 'https://picsum.photos/seed/kerala-backwater/800/600', 'Kerala, India', 5, 'Easy', 2, 8, 16000, (SELECT id FROM public.users WHERE email='guide2@demo.com' LIMIT 1), 'Relaxation', true, 4.6, 112, '[{"day":1,"title":"Houseboat check-in"},{"day":2,"title":"Backwater Cruise"}]', '["Meals", "Houseboat"]'),
('Goa Coastal Explorer', 'goa-coastal', 'Explore the hidden beaches, historic forts, and vibrant culture of Goa beyond the parties.', '4 Days in Goa', 'https://picsum.photos/seed/goa-coastal/800/600', 'Goa, India', 4, 'Easy', 3, 20, 9500, (SELECT id FROM public.users WHERE email='guide3@demo.com' LIMIT 1), 'Beach', true, 4.5, 95, '[{"day":1,"title":"South Goa Beaches"},{"day":2,"title":"Fort Aguada"}]', '["Breakfast", "Hotel"]'),
('Rajasthan Heritage Trail', 'rajasthan-heritage', 'Discover the royal palaces, majestic forts, and rich heritage of the pink city and beyond.', '7 Days in Rajasthan', 'https://picsum.photos/seed/rajasthan-heritage/800/600', 'Rajasthan, India', 7, 'Easy', 5, 25, 18000, (SELECT id FROM public.users WHERE email='guide1@demo.com' LIMIT 1), 'Culture', true, 4.8, 150, '[{"day":1,"title":"Jaipur City Tour"},{"day":2,"title":"Jodhpur Fort"}]', '["Hotels", "Guide"]'),
('Sikkim Mountain Retreat', 'sikkim-retreat', 'Immerse yourself in the Buddhist culture and stunning Himalayan vistas of Sikkim.', '6 Days in Sikkim', 'https://picsum.photos/seed/sikkim-retreat/800/600', 'Sikkim, India', 6, 'Medium', 4, 15, 14000, (SELECT id FROM public.users WHERE email='guide2@demo.com' LIMIT 1), 'Mountain', true, 4.7, 75, '[{"day":1,"title":"Gangtok Arrival"},{"day":2,"title":"Tsomgo Lake"}]', '["Meals", "Transport"]'),
('Kashmir Great Lakes', 'kashmir-lakes', 'Trek across seven pristine alpine lakes in Kashmir, often called heaven on earth.', '8 Days in Kashmir', 'https://picsum.photos/seed/kashmir-lakes/800/600', 'Kashmir, India', 8, 'Hard', 7, 12, 22000, (SELECT id FROM public.users WHERE email='guide3@demo.com' LIMIT 1), 'Trekking', true, 4.9, 130, '[{"day":1,"title":"Srinagar to Sonamarg"},{"day":2,"title":"Nichnai Pass"}]', '["Camping", "Meals"]'),
('Andaman Island Explorer', 'andaman-explorer', 'Scuba diving, snorkeling, and island hopping in the crystal clear waters of the Andamans.', '6 Days in Andaman', 'https://picsum.photos/seed/andaman-explorer/800/600', 'Andaman, India', 6, 'Medium', 4, 15, 21000, (SELECT id FROM public.users WHERE email='guide1@demo.com' LIMIT 1), 'Beach', true, 4.8, 90, '[{"day":1,"title":"Port Blair Arrival"},{"day":2,"title":"Havelock Island"}]', '["Ferry", "Hotels"]'),
('Darjeeling Tea Trail', 'darjeeling-tea', 'Wander through lush green tea estates and view the majestic Kanchenjunga at sunrise.', '4 Days in West Bengal', 'https://picsum.photos/seed/darjeeling-tea/800/600', 'West Bengal, India', 4, 'Easy', 2, 20, 8500, (SELECT id FROM public.users WHERE email='guide2@demo.com' LIMIT 1), 'Nature', true, 4.6, 65, '[{"day":1,"title":"Tea Garden Visit"},{"day":2,"title":"Tiger Hill Sunrise"}]', '["Hotels", "Breakfast"]'),
('Spiti Valley Expedition', 'spiti-valley', 'A thrilling road trip through the rugged and remote Spiti Valley landscapes.', '9 Days in Himachal Pradesh', 'https://picsum.photos/seed/spiti-valley/800/600', 'Himachal Pradesh, India', 9, 'Hard', 8, 10, 24000, (SELECT id FROM public.users WHERE email='guide3@demo.com' LIMIT 1), 'Adventure', true, 4.9, 180, '[{"day":1,"title":"Shimla to Kalpa"},{"day":2,"title":"Kaza Exploration"}]', '["Transport", "Hotels"]'),
('Rishikesh Adventure Tour', 'rishikesh-adventure', 'Experience the adrenaline rush in the white water rafting and bungee jumping capital of India.', '4 Days in Uttarakhand', 'https://picsum.photos/seed/rishikesh-adventure/800/600', 'Uttarakhand, India', 4, 'Medium', 3, 20, 7500, (SELECT id FROM public.users WHERE email='guide1@demo.com' LIMIT 1), 'Adventure', true, 4.7, 210, '[{"day":1,"title":"River Rafting"},{"day":2,"title":"Bungee Jumping"}]', '["Camping", "Meals"]'),
('Coorg Nature Escape', 'coorg-nature', 'Experience the Scotland of India amidst sprawling coffee plantations and misty hills.', '4 Days in Karnataka', 'https://picsum.photos/seed/coorg-nature/800/600', 'Karnataka, India', 4, 'Easy', 2, 15, 9000, (SELECT id FROM public.users WHERE email='guide2@demo.com' LIMIT 1), 'Nature', true, 4.5, 80, '[{"day":1,"title":"Abbey Falls"},{"day":2,"title":"Coffee Plantation Walk"}]', '["Homestay", "Meals"]'),
('Munnar Hills & Tea Gardens', 'munnar-hills', 'Escape to the misty hills and expansive tea gardens of Munnar.', '5 Days in Kerala', 'https://picsum.photos/seed/munnar-hills/800/600', 'Kerala, India', 5, 'Easy', 3, 20, 11500, (SELECT id FROM public.users WHERE email='guide3@demo.com' LIMIT 1), 'Nature', true, 4.8, 140, '[{"day":1,"title":"Tea Museum Visit"},{"day":2,"title":"Eravikulam National Park"}]', '["Hotels", "Transport"]'),
('Valley & Lake Explorer', 'valley-lake', 'Discover hidden alpine lakes and lush valleys in the heart of the mountains.', '5 Days in Himachal Pradesh', 'https://picsum.photos/seed/valley-lake/800/600', 'Himachal Pradesh, India', 5, 'Medium', 4, 15, 13000, (SELECT id FROM public.users WHERE email='guide1@demo.com' LIMIT 1), 'Mountain', true, 4.6, 95, '[{"day":1,"title":"Lake Visit"},{"day":2,"title":"Valley Trek"}]', '["Guide", "Meals"]'),
('Northeast Explorer', 'northeast-explorer', 'A comprehensive tour of Assam and Meghalaya, experiencing wildlife and living cultures.', '8 Days in Assam/Meghalaya', 'https://picsum.photos/seed/northeast-explorer/800/600', 'Assam/Meghalaya, India', 8, 'Medium', 6, 12, 23000, (SELECT id FROM public.users WHERE email='guide2@demo.com' LIMIT 1), 'Culture', true, 4.7, 110, '[{"day":1,"title":"Kaziranga Safari"},{"day":2,"title":"Shillong Trip"}]', '["Hotels", "Safari"]'),
('Jaisalmer Desert Adventure', 'jaisalmer-desert', 'Embark on camel safaris and enjoy camping under the starry skies in the Thar Desert.', '4 Days in Rajasthan', 'https://picsum.photos/seed/jaisalmer-desert/800/600', 'Rajasthan, India', 4, 'Easy', 2, 20, 10500, (SELECT id FROM public.users WHERE email='guide3@demo.com' LIMIT 1), 'Desert', true, 4.8, 160, '[{"day":1,"title":"Desert Camp Arrival"},{"day":2,"title":"Camel Safari"}]', '["Camping", "Meals"]'),
('Arunachal Mountain Expedition', 'arunachal-expedition', 'Journey to Tawang and witness majestic monasteries and pristine high-altitude lakes.', '9 Days in Arunachal Pradesh', 'https://picsum.photos/seed/arunachal-expedition/800/600', 'Arunachal Pradesh, India', 9, 'Hard', 8, 10, 26000, (SELECT id FROM public.users WHERE email='guide1@demo.com' LIMIT 1), 'Adventure', true, 4.9, 85, '[{"day":1,"title":"Bomdila Drive"},{"day":2,"title":"Tawang Monastery"}]', '["Transport", "Permits"]'),
('Dhanaulti Forest Escape', 'dhanaulti-forest', 'A quick and rejuvenating getaway to the serene alpine forests of Dhanaulti.', '3 Days in Uttarakhand', 'https://picsum.photos/seed/dhanaulti-forest/800/600', 'Uttarakhand, India', 3, 'Easy', 1, 25, 5500, (SELECT id FROM public.users WHERE email='guide2@demo.com' LIMIT 1), 'Nature', true, 4.5, 55, '[{"day":1,"title":"Eco Park Visit"},{"day":2,"title":"Forest Walk"}]', '["Hotels", "Meals"]')
ON CONFLICT (slug) DO NOTHING;
