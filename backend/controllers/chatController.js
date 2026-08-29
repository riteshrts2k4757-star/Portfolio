import { getUsersWithRecentMessages, getConversation, markAsRead, saveMessage } from '../models/chatModel.js';

export const getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await getUsersWithRecentMessages(currentUserId);
    res.json(users);
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;
    const messages = await getConversation(currentUserId, userId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markMessagesRead = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params; // The user whose messages we are reading
    await markAsRead(userId, currentUserId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fallback REST endpoint for sending messages (primarily handled by WebSockets)
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message, type } = req.body;
    
    if (!receiverId || !message) {
      return res.status(400).json({ error: 'receiverId and message are required' });
    }
    
    const savedMessage = await saveMessage(senderId, receiverId, message, type);
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
