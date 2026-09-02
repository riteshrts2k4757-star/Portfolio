import supabase from '../../db.js';

// Table is now created via Supabase SQL Editor.
export const createMessagesTable = async () => {
  console.log('✅ Messages table managed by Supabase');
};

export const saveMessage = async (senderId, receiverId, message, type = 'text') => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message: message,
      message_type: type,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

export const getConversation = async (userId1, userId2) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
    )
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const markAsRead = async (senderId, receiverId) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('is_read', false);

  if (error) throw error;
};

export const getUsersWithRecentMessages = async (currentUserId) => {
  // Call the database function created in Supabase SQL Editor
  const { data, error } = await supabase
    .rpc('get_users_with_recent_messages', { current_user_id: currentUserId });

  if (error) throw error;
  return data || [];
};
