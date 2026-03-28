import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import socketServerPlugin from './plugins/vitePluginSocketIOServer.ts';
import socketServer from './server/socket.ts';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), socketServerPlugin(socketServer), sveltekit()]
});
