import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { saveMessage } from '../models/chatModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

export function setupChatServer(server) {
  const wss = new WebSocketServer({ noServer: true });
  
  // Map to store connected clients: Map<userId, WebSocket>
  const clients = new Map();

  server.on('upgrade', (request, socket, head) => {
    // Only handle upgrade requests for the chat endpoint
    if (request.url.startsWith('/api/chat-ws')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  const broadcastPresence = (userId, isOnline) => {
    const message = JSON.stringify({
      type: 'presence',
      userId,
      isOnline
    });
    for (const [id, ws] of clients.entries()) {
      if (id !== userId && ws.readyState === 1) { // 1 = OPEN
        ws.send(message);
      }
    }
  };

  wss.on('connection', (ws, req) => {
    let currentUserId = null;

    ws.on('message', async (messageData) => {
      try {
        const parsed = JSON.parse(messageData);

        if (parsed.type === 'authenticate') {
          // Verify token
          const decoded = jwt.verify(parsed.token, JWT_SECRET);
          currentUserId = decoded.id;
          clients.set(currentUserId, ws);
          console.log(`💬 User ${currentUserId} authenticated in Chat WS`);
          
          // Broadcast that this user is online
          broadcastPresence(currentUserId, true);
          
          // Send current online users to the newly connected user
          const onlineUsers = Array.from(clients.keys());
          ws.send(JSON.stringify({ type: 'online_users', users: onlineUsers }));
          return;
        }

        // Must be authenticated to send messages
        if (!currentUserId) {
          return ws.send(JSON.stringify({ error: 'Unauthenticated' }));
        }

        if (parsed.type === 'send_message') {
          const { receiverId, message, messageType = 'text' } = parsed;
          
          // Save to database
          const savedMessage = await saveMessage(currentUserId, receiverId, message, messageType);
          
          // Echo back to sender so they get the DB-generated ID and timestamp
          ws.send(JSON.stringify({ type: 'message_sent', data: savedMessage }));

          // Forward to receiver if online
          const receiverWs = clients.get(parseInt(receiverId));
          if (receiverWs && receiverWs.readyState === 1) {
            receiverWs.send(JSON.stringify({ type: 'new_message', data: savedMessage }));
          }
        }
      } catch (err) {
        console.error('WebSocket Error:', err.message);
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ error: 'Failed to process message' }));
        }
      }
    });

    ws.on('close', () => {
      if (currentUserId) {
        clients.delete(currentUserId);
        broadcastPresence(currentUserId, false);
        console.log(`💬 User ${currentUserId} disconnected from Chat WS`);
      }
    });
  });
}
