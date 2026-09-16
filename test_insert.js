import supabase from './db.js';

async function testInsert() {
  const bookingData = {
    user_id: 1, // assuming user 1 exists
    tour_id: 'fed9b7ca-0bbf-4539-1e8e-2595daeb0000', // valid UUID format but maybe doesn't exist?
    tour_date: '2026-10-10',
    number_of_people: 2,
    total_amount: 1000,
    payment_method: 'card',
    payment_status: 'pending',
    booking_status: 'pending'
  };

  const { data, error } = await supabase.from('bookings').insert(bookingData).select();
  if (error) {
    console.log("INSERT ERROR:", error);
  } else {
    console.log("INSERT SUCCESS:", data);
  }
}
testInsert();
