import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:5001';
const proxyHeaders = process.env.VITE_PROXY_APIKEY
  ? { apikey: process.env.VITE_PROXY_APIKEY }
  : {};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        headers: proxyHeaders,
      },
    },
  },
});
