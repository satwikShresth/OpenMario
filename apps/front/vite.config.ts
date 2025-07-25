import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { heyApiPlugin } from "@hey-api/vite-plugin";
import { resolve } from "node:path";
import { defaultPlugins } from "@hey-api/openapi-ts";
import process from "node:process";
import { FixDir } from "./plugins/heyapifix.ts";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const plugins = [
    deno(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ];
  console.log(JSON.stringify(process.env.MEILI_HOST));

  // Only add heyApiPlugin during development
  if (command === "serve") {
    plugins.push(
      //@ts-ignore: shut up
      heyApiPlugin({
        config: {
          input: {
            path: "http://localhost:3000/openapi",
          },
          output: {
            path: "./src/client",
          },
          plugins: [
            ...defaultPlugins,
            {
              name: "@hey-api/client-fetch",
              exportFromIndex: "true",
              path: "./src/client",
              runtimeConfigPath: "./src/client.config.ts",
            },
            {
              name: "@tanstack/react-query",
              //@ts-ignore: shut up
              exportFromIndex: true,
            },
            {
              name: "@hey-api/sdk",
              operationId: true,
              exportFromIndex: false,
            },
          ],
        },
      }),
      FixDir(),
    );
  }

  return {
    plugins,
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
        "/api/search": {
          target: process.env.MEILI_HOST,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/search/, ""),
        },
      },
    },
  };
});
