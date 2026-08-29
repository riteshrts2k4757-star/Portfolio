import pool from '../../db.js';

export const createMessagesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      message_type VARCHAR(50) DEFAULT 'text',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
  `;
  try {
    await pool.query(query);
    console.log('✅ Messages table is ready');
  } catch (error) {
    console.error('❌ Error creating messages table:', error);
  }
};

export const saveMessage = async (senderId, receiverId, message, type = 'text') => {
  const result = await pool.query(
    'INSERT INTO messages (sender_id, receiver_id, message, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
    [senderId, receiverId, message, type]
  );
  return result.rows[0];
};

export const getConversation = async (userId1, userId2) => {
  const result = await pool.query(
    `SELECT * FROM messages 
     WHERE (sender_id = $1 AND receiver_id = $2) 
        OR (sender_id = $2 AND receiver_id = $1) 
     ORDER BY created_at ASC`,
    [userId1, userId2]
  );
  return result.rows;
};

export const markAsRead = async (senderId, receiverId) => {
  await pool.query(
    'UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false',
    [senderId, receiverId] // Note: if receiverId (me) is marking messages sent by senderId as read
  );
};

export const getUsersWithRecentMessages = async (currentUserId) => {
  // Query to get all users except the current user, along with their last message and unread count
  const query = `
    SELECT 
      u.id, 
      u.username, 
      u.profile_picture,
      (
        SELECT message 
        FROM messages m 
        WHERE (m.sender_id = u.id AND m.receiver_id = $1) 
           OR (m.sender_id = $1 AND m.receiver_id = u.id)
        ORDER BY created_at DESC 
        LIMIT 1
      ) as last_message,
      (
        SELECT created_at 
        FROM messages m 
        WHERE (m.sender_id = u.id AND m.receiver_id = $1) 
           OR (m.sender_id = $1 AND m.receiver_id = u.id)
        ORDER BY created_at DESC 
        LIMIT 1
      ) as last_message_time,
      (
        SELECT COUNT(*) 
        FROM messages m 
        WHERE m.sender_id = u.id AND m.receiver_id = $1 AND m.is_read = false
      ) as unread_count
    FROM users u
    ORDER BY last_message_time DESC NULLS LAST, u.username ASC;
  `;
  const result = await pool.query(query, [currentUserId]);
  return result.rows;
};
