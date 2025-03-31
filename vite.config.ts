import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/rtsp-proxy': 'http://localhost:3000',
      '/webrtc-offer': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  }
});
