import supabase from './db.js';

async function updateUserImages() {
  const { data: users, error } = await supabase.from('users').select('id, profile_picture');
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  const usersToUpdate = users.filter(u => !u.profile_picture || u.profile_picture.trim() === '');
  console.log(`Found ${usersToUpdate.length} users with no profile picture. Updating...`);

  for (let i = 0; i < usersToUpdate.length; i++) {
    const user = usersToUpdate[i];
    // Using picsum.photos with a random seed for unique profile pics
    const imageUrl = `https://picsum.photos/seed/user-${user.id}/150/150`;
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_picture: imageUrl })
      .eq('id', user.id);
      
    if (updateError) {
      console.error(`Error updating user ${user.id}:`, updateError);
    } else {
      console.log(`Updated user ${user.id} with image ${imageUrl}`);
    }
  }
  
  console.log('Finished updating user profile pictures.');
}

updateUserImages();
