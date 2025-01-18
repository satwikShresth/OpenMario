import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  client: "legacy/axios",
  input: "../openapi.json",
  output: "./app/client",
  plugins: [
    {
      name: "@hey-api/sdk",
      asClass: true,
      operationId: true,
      methodNameBuilder: (operation) => {
        // @ts-ignore
        let name: string = operation.name
        // @ts-ignore
        let service: string = operation.service

        if (service && name.toLowerCase().startsWith(service.toLowerCase())) {
          name = name.slice(service.length)
        }

        return name.charAt(0).toLowerCase() + name.slice(1)
      },
    },
  ],
})
