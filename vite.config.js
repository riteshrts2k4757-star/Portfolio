import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { setupRCGameServer } from './server/websocket/rcGameServer.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ws-server',
      configureServer(server) {
        setupRCGameServer(server.httpServer);
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  }
})
