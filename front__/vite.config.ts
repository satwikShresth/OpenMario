import { defineConfig } from 'vite'
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    proxy: {
      "/api/v1": "http://localhost:3000",
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [
    tsconfigPaths(),
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react()
  ],
})
