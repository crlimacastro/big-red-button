import { createServer } from 'node:http';
import express from 'express';
import socketServer from './socket.ts';
import { handler } from '../build/handler.js';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

const io = new Server(server);
socketServer(io);
app.use(handler);

const port = process.env.SERVER_PORT || 3000;
server.listen(port, () => {
  const address = server.address();
  if (!address)
  {
    console.log(`Server running on port ${port}`);
  }
  else if (typeof address === 'string')
  {
    console.log(`Server running on ${address}`);
  }
  else
  {
    console.log(`Server running on ${address.address}:${address.port}`);
  }
});
