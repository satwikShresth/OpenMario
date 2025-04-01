import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { swaggerUI } from 'npm:@hono/swagger-ui';
import defaultOptions from 'npm:express-jsdoc-swagger/config/default.js';
import swaggerEventsOptions from 'npm:express-jsdoc-swagger/config/swaggerEvents.js';
import processSwagger from 'npm:express-jsdoc-swagger/processSwagger.js';
import swaggerEvents from 'npm:express-jsdoc-swagger/swaggerEvents.js';
import generateOpenAPIComponents from '#/utils/openapi.ts';

const options = {
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
         variables: {
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

export const debugMiddlewares = async (app: Hono<any>) => {
   const merge = await import('merge');
   const userOptions = {
      ...options,
      baseDir: Deno.cwd(),
      filesPattern: './src/routes/*.routes.ts',
      swaggerUIPath: '/v1/docs',
      exposeSwaggerUI: true,
      exposeApiDocs: true,
      apiDocsPath: '/v1/openapi.json',
   };

   const events = swaggerEvents(swaggerEventsOptions(userOptions));
   let openApiSpec = {};

   processSwagger(
      {
         ...defaultOptions,
         ...userOptions,
      },
      events.processFile,
   )
      .then((result) => {
         openApiSpec = {
            ...openApiSpec,
            ...result.swaggerObject,
         };
         openApiSpec = merge.recursive(
            true,
            openApiSpec,
            generateOpenAPIComponents(options),
         );
         events.finish(openApiSpec, {
            jsdocInfo: result.jsdocInfo,
            getPaths: result.getPaths,
            getComponents: result.getComponents,
            getTags: result.getTags,
         });
      })
      .catch(events.error);

   app.use('*', prettyJSON());
   app.get('/doc', (c) => c.json(openApiSpec));
   app.get('/doc/ui', swaggerUI({ url: '/doc' }));
};
