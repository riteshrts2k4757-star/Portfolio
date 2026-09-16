-- 1. Fix RLS Policies (Allows your backend to insert bookings & reviews since it uses the anon key)
CREATE POLICY "Allow all operations for bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for tours" ON public.tours FOR ALL USING (true) WITH CHECK (true);

-- 2. Insert Dummy Bookings & Reviews
DO $$
DECLARE
    v_user_id integer;
    v_tour_id uuid;
    v_booking_id uuid;
BEGIN
    -- Get a user ID
    SELECT id INTO v_user_id FROM public.users WHERE role='user' LIMIT 1;
    IF v_user_id IS NULL THEN
       SELECT id INTO v_user_id FROM public.users LIMIT 1;
    END IF;

    -- Add Review 1
    SELECT id INTO v_tour_id FROM public.tours ORDER BY created_at ASC LIMIT 1 OFFSET 0;
    IF v_tour_id IS NOT NULL THEN
        INSERT INTO public.bookings (user_id, tour_id, tour_date, number_of_people, total_amount, payment_status, booking_status)
        VALUES (v_user_id, v_tour_id, '2024-05-10', 2, 10000, 'paid', 'completed')
        RETURNING id INTO v_booking_id;
        
        INSERT INTO public.reviews (tour_id, user_id, booking_id, rating, review_text)
        VALUES (v_tour_id, v_user_id, v_booking_id, 5, 'Absolutely amazing experience! The guide was very knowledgeable and the views were breathtaking.');
        
        UPDATE public.tours SET rating = 5, review_count = 1 WHERE id = v_tour_id;
    END IF;

    -- Add Review 2
    SELECT id INTO v_tour_id FROM public.tours ORDER BY created_at ASC LIMIT 1 OFFSET 1;
    IF v_tour_id IS NOT NULL THEN
        INSERT INTO public.bookings (user_id, tour_id, tour_date, number_of_people, total_amount, payment_status, booking_status)
        VALUES (v_user_id, v_tour_id, '2024-06-15', 1, 5000, 'paid', 'completed')
        RETURNING id INTO v_booking_id;
        
        INSERT INTO public.reviews (tour_id, user_id, booking_id, rating, review_text)
        VALUES (v_tour_id, v_user_id, v_booking_id, 5, 'Highly recommended! Well organized and the itinerary was perfect for our family.');
        
        UPDATE public.tours SET rating = 5, review_count = 1 WHERE id = v_tour_id;
    END IF;

    -- Add Review 3
    SELECT id INTO v_tour_id FROM public.tours ORDER BY created_at ASC LIMIT 1 OFFSET 2;
    IF v_tour_id IS NOT NULL THEN
        INSERT INTO public.bookings (user_id, tour_id, tour_date, number_of_people, total_amount, payment_status, booking_status)
        VALUES (v_user_id, v_tour_id, '2024-07-20', 4, 20000, 'paid', 'completed')
        RETURNING id INTO v_booking_id;
        
        INSERT INTO public.reviews (tour_id, user_id, booking_id, rating, review_text)
        VALUES (v_tour_id, v_user_id, v_booking_id, 4, 'A trip of a lifetime. Everything from the accommodations to the activities was top notch.');
        
        UPDATE public.tours SET rating = 4, review_count = 1 WHERE id = v_tour_id;
    END IF;
END $$;
