import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
   ],
   resolve: {
      alias: {
         '@': resolve(__dirname, './src'),
      },
   },
   server: {
      proxy: {
         '/api/v1': {
            target: process.env.VITE_API_URL || 'http://localhost:3000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
         },
         '/api/search': {
            target: process.env.VITE_SEARCH_API_URL || 'http://localhost:7700',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/search/, ''),
         },
      },
   },
});
