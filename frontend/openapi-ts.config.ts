import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts"

export default defineConfig({
  client: "@hey-api/client-axios",
  input: "../openapi.json",
  output: ".client",
  plugins: [
    ...defaultPlugins,
    {
      name: "@hey-api/sdk",
      asClass: true,
      validator: "zod",
      operationId: true,
      //methodNameBuilder: (operation) => {
      // @ts-ignore
      //let name: string = operation.name
      // @ts-ignore
      /*
{
id: 'getBooks',
method: 'get',
path: '/books',
description: 'Get all books with optional filtering',
tags: [ 'Books' ],
parameters: { query: { title: [Object], genre: [Object], pub_year: [Object] } },
responses: { '200': { mediaType: 'application/json', schema: [Object] } }
}
       * */
      //  let service: string = operation.service
      //  console.log(operation)
      //  if (service && name.toLowerCase().startsWith(service.toLowerCase())) {
      //    name = name.slice(service.length)
      //  }
      //  console.log(name)
      //
      //  return name[0].toLowerCase() + name.slice(1)
      //},
    },
  ],
})
