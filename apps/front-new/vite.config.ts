import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { heyApiPlugin } from "@hey-api/vite-plugin";
import { resolve } from "node:path";
import { defaultPlugins } from "@hey-api/openapi-ts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    deno(),
    heyApiPlugin({
      config: {
        input: {
          path: "http://localhost:3000/openapi",
        },
        output: "./src/client",
        plugins: [
          ...defaultPlugins,
          {
            name: "@hey-api/client-fetch",
            exportFromIndex: "true",
            runtimeConfigPath: "./src/client.config.ts",
          },
          {
            name: "@tanstack/react-query",
            exportFromIndex: "true",
          },
          {
            name: "@hey-api/sdk",
            operationId: true,
            exportFromIndex: "false",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      // "/api/search": {
      //   target: "http://localhost:7700",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api\/search/, ""),
      // },
    },
  },
});
