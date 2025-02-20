import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import registerComponents from './components.ts';
import expressJSDocSwagger from 'express-jsdoc-swagger';

export const registry = new OpenAPIRegistry();

export const options = {
   openapi: '3.0.0',
   info: {
      title: 'Coop Salary Board API',
      version: '1.0.0',
      description: 'API for collection coop salaries anonymously',
   },
   servers: [
      {
         url: 'http://localhost:{port}/{basePath}',
         description: 'The Development API server',
         'variables': {
            port: {
               default: '3000',
            },
            basePath: {
               default: 'v1',
            },
         },
      },
   ],
};

//Auth Schemas
registry.registerComponent(
   'securitySchemes',
   'bearerAuth',
   {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
   },
);

registerComponents(registry);

export const generateOpenAPI = (registry: OpenAPIRegistry) => {
   const generator = new OpenApiGeneratorV3(registry.definitions);

   return generator.generateDocument(options);
};

//await Deno.writeTextFile(
//   Deno.args[0],
//);
