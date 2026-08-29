import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { setupRCGameServer } from './websocket/rcGameServer.js';

const app = express();
app.use(cors());
const server = createServer(app);

setupRCGameServer(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`RC Game Server running on port ${PORT}`);
});
