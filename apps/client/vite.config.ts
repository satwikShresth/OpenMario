import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      // devtools(),
      tanstackRouter({
         target: 'react',
         autoCodeSplitting: true
      }),
      viteReact({
         babel: {
            plugins: ['babel-plugin-react-compiler']
         }
      }),
      tsconfigPaths({
         projects: ['./tsconfig.json']
      }),
      tailwindcss()
   ],
   resolve: {
      alias: {
         '@': fileURLToPath(new URL('./src', import.meta.url))
      }
   },
   server: {
      port: 5173,
      proxy: {
         '/api/v1': {
            target: `http://localhost:${import.meta.env.PORT}`,
            changeOrigin: true,
            rewrite: path => path.replace(/^\/api/, '')
         }
      }
   }
});
