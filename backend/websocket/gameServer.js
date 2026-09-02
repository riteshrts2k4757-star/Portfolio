import { WebSocketServer } from 'ws';

export function setupGameServer(server) {
  const wss = new WebSocketServer({ noServer: true });
  
  let gameClient = null;
  let phoneClient = null;

  server.on('upgrade', (request, socket, head) => {
    if (request.url.startsWith('/api/game-ws')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`🔌 New Game WebSocket connection: ${clientIP}`);

    ws.on('message', (msg) => {
      const text = msg.toString().trim();

      if (text === 'REGISTER_GAME') {
        gameClient = ws;
        console.log('🎮 Game connected via main server');
        ws.send('GAME_OK');
        return;
      }

      if (text === 'REGISTER_PHONE') {
        phoneClient = ws;
        console.log('📱 Phone connected via main server');
        ws.send('PHONE_OK');
        if (gameClient && gameClient.readyState === 1) { // 1 = OPEN
          gameClient.send('PHONE_CONNECTED');
        }
        return;
      }

      if (ws === phoneClient) {
        // Intentionally not logging phone input to keep terminal clean
      }

      // Handle WebRTC Signaling
      if (text.startsWith('{')) {
        try {
          const parsed = JSON.parse(text);
          if (parsed.type === 'webrtc') {
            if (ws === gameClient && phoneClient && phoneClient.readyState === 1) {
              phoneClient.send(text);
            } else if (ws === phoneClient && gameClient && gameClient.readyState === 1) {
              gameClient.send(text);
            }
            return; // don't forward twice
          }
        } catch (e) {
          // ignore parse errors, might be normal string command
        }
      }

      if (gameClient && gameClient.readyState === 1) {
        gameClient.send(text);
      } else {
        if (ws === phoneClient) {
          // Game not connected
        }
      }
    });

    ws.on('close', () => {
      if (ws === phoneClient) {
        phoneClient = null;
        console.log('📴 Phone disconnected');
        if (gameClient && gameClient.readyState === 1) {
          gameClient.send('PHONE_DISCONNECTED');
        }
      }
      if (ws === gameClient) {
        gameClient = null;
        console.log('🎮 Game disconnected');
      }
    });

    ws.on('error', (error) => {
      console.log('❌ Game WebSocket error:', error.message);
    });
  });
}
