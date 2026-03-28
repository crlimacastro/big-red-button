import { type ViteDevServer } from "vite";
import { Server } from 'socket.io';

export default function (callback: (io: Server) => void) {
  return {
    name: 'vite-plugin-socket-io-server',
    configureServer(viteDevServer: ViteDevServer) {
      if (!viteDevServer.httpServer) return;
      const io = new Server(viteDevServer.httpServer);
      callback(io);
    }
  };
}
