import supabase from './db.js';

async function updateTourImages() {
  const { data: tours, error } = await supabase.from('tours').select('id');
  if (error) {
    console.error('Error fetching tours:', error);
    return;
  }

  console.log(`Found ${tours.length} tours. Updating images...`);

  for (let i = 0; i < tours.length; i++) {
    const tour = tours[i];
    // Using picsum.photos with a random seed to generate unique images for each tour
    const imageUrl = `https://picsum.photos/seed/${tour.id}/800/600`;
    
    const { error: updateError } = await supabase
      .from('tours')
      .update({ image_url: imageUrl })
      .eq('id', tour.id);
      
    if (updateError) {
      console.error(`Error updating tour ${tour.id}:`, updateError);
    } else {
      console.log(`Updated tour ${tour.id} with image ${imageUrl}`);
    }
  }
  
  console.log('Finished updating all tour images.');
}

updateTourImages();
