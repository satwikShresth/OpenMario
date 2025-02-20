import {
   OpenApiGeneratorV3,
   OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';

import submissionDef from './submission.def.ts';

export const registry = new OpenAPIRegistry();
//const bearerAuth = registry.registerComponent(
//   'securitySchemes',
//   'bearerAuth',
//   {
//      type: 'http',
//      scheme: 'bearer',
//      bearerFormat: 'JWT',
//   },
//);

submissionDef(registry, '/submission');

export const generateOpenAPI = (registry: OpenAPIRegistry) => {
   const generator = new OpenApiGeneratorV3(registry.definitions);

   return generator.generateDocument({
      openapi: '3.0.0',
      info: {
         title: 'Book Management API',
         version: '1.0.0',
         description: 'API for managing books and authors',
      },
      servers: [{ url: 'http://localhost:3000/api' }],
   });
};

await Deno.writeTextFile(
   Deno.args[0],
   JSON.stringify(generateOpenAPI(registry), null, 3),
);
