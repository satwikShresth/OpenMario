import babel from '@rolldown/plugin-babel';
import { devtools } from '@tanstack/devtools-vite';
import tailwindcss from '@tailwindcss/vite';
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { tanstackRouter } from '@tanstack/router-plugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
   server: {
    port: 5173,
   },
   plugins: [
      devtools(),
      tailwindcss(),
      tanstackRouter({
         target: 'react',
         autoCodeSplitting: true
      }),
      viteReact(),
      babel({
         presets: [reactCompilerPreset()],
         plugins: ['@babel/plugin-transform-react-display-name']
      }),
   ],
   resolve: {
      tsconfigPaths: true
   }
});
