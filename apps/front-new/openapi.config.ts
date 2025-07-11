import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../../docs/openapi.json",
  output: "./src/client",
  plugins: [
    ...defaultPlugins,
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./src/client.ts",
    },
    "@tanstack/react-query",
    {
      name: "@hey-api/sdk",
      operationId: true,
    },
  ],
});
