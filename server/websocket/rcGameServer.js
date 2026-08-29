import { WebSocketServer } from 'ws';
import { SessionManager } from './sessionManager.js';

export function setupRCGameServer(server) {
  const wss = new WebSocketServer({ noServer: true });
  const sessionManager = new SessionManager();

  // Attach to Vite's HTTP server safely without breaking HMR
  server.on('upgrade', (request, socket, head) => {
    // If it's Vite's HMR, let Vite handle it natively
    if (request.headers['sec-websocket-protocol'] === 'vite-hmr') {
      return;
    }
    
    // Accept ALL other WebSocket connections regardless of the path
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`[WS] Client connected from IP: ${clientIp}`);
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', (message) => {
      const rawString = message.toString();
      console.log(`[WS] 📥 Raw data received: "${rawString}"`);
      
      // Handle MIT App Inventor plain text messages
      const textMsg = rawString.trim();
      const match = textMsg.match(/^([FB])(\d+)([LR])(\d+)$/);
      if (match) {
        const dir = match[1];
        const speed = parseInt(match[2], 10);
        const steerDir = match[3];
        const steerValue = parseInt(match[4], 10);

        let throttle = 0;
        if (dir === 'F') throttle = speed / 100;
        if (dir === 'B') throttle = -(speed / 100);

        let steering = 0;
        if (steerDir === 'R') steering = steerValue / 100;
        if (steerDir === 'L') steering = -(steerValue / 100);

        // Treat 0 as stop
        if (speed === 0) throttle = 0;
        if (steerValue === 0) steering = 0;
        
        console.log(`[WS] 📱 Phone Data -> Raw: "${textMsg}" | Throttle: ${throttle} | Steering: ${steering}`);

        const payload = JSON.stringify({
          type: 'phone_control_raw',
          throttle,
          steering,
        });

        // Broadcast to all clients (the browser game will pick it up)
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === 1) {
            client.send(payload);
          }
        });
        return;
      }

      // Existing JSON handling
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'create_session': {
            const code = sessionManager.createSession(ws);
            ws.send(JSON.stringify({ type: 'session_created', code }));
            break;
          }
          
          case 'pair': {
            const success = sessionManager.pairPhone(data.code, ws);
            if (success) {
              const session = sessionManager.getSessionByCode(data.code);
              ws.send(JSON.stringify({ type: 'paired_success' }));
              if (session.browserWs) {
                session.browserWs.send(JSON.stringify({ type: 'phone_connected' }));
              }
            } else {
              ws.send(JSON.stringify({ type: 'error', message: 'Invalid pairing code' }));
            }
            break;
          }
          
          case 'controller': {
            const sessionInfo = sessionManager.getSessionByWs(ws);
            if (sessionInfo && sessionInfo.session.browserWs) {
              sessionInfo.session.browserWs.send(JSON.stringify({
                type: 'controller',
                throttle: data.throttle || 0,
                steering: data.steering || 0,
                brake: data.brake || false,
                timestamp: data.timestamp || Date.now()
              }));
            }
            break;
          }

          case 'game': {
            const sessionInfo = sessionManager.getSessionByWs(ws);
            if (sessionInfo && sessionInfo.session.phoneWs) {
              sessionInfo.session.phoneWs.send(JSON.stringify({
                type: 'game',
                command: data.command
              }));
            }
            break;
          }
          
          case 'emergency_stop': {
             const sessionInfo = sessionManager.getSessionByWs(ws);
             if (sessionInfo) {
                if (sessionInfo.session.browserWs) {
                  sessionInfo.session.browserWs.send(JSON.stringify({ type: 'emergency_stop' }));
                }
                if (sessionInfo.session.phoneWs) {
                  sessionInfo.session.phoneWs.send(JSON.stringify({ type: 'emergency_stop' }));
                }
             }
             break;
          }
        }
      } catch (e) {
        // Ignored, was likely non-JSON text or other junk
      }
    });

    ws.on('close', () => {
      console.log('[WS] Client disconnected');
      
      // Notify browser of possible raw phone disconnect
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify({ type: 'phone_disconnected_raw' }));
        }
      });

      const sessionInfo = sessionManager.getSessionByWs(ws);
      if (sessionInfo) {
        const { code, session } = sessionInfo;
        if (ws === session.browserWs) {
          sessionManager.removeSession(code);
        } else if (ws === session.phoneWs) {
          session.phoneWs = null;
          if (session.browserWs) {
            session.browserWs.send(JSON.stringify({ type: 'phone_disconnected' }));
          }
        }
      }
    });
  });

  // Watchdog
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
}
