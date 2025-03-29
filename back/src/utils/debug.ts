//import OPENAPI_SPECS from '../../../openapi.json' with { type: 'json' };
import { Request } from 'express';
import morgan from 'morgan';
import expressJSDocSwagger from 'npm:express-jsdoc-swagger';
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

export const debugMiddlewares = (app: any) => {
   morgan.token('body', (req: Request) => JSON.stringify(req.body));
   morgan.token('query', (req: Request) => JSON.stringify(req.query));
   app.use(
      morgan(
         ':method :url :status :response-time ms\n{\nbody: :body\nquery: :query\n}',
      ),
   );

   //@ts-ignore: Because this libarary does not have good typiung support
   expressJSDocSwagger(app)(
      {
         ...options,
         baseDir: Deno.cwd(),
         filesPattern: './src/routes/*.routes.ts',
         swaggerUIPath: '/v1/docs',
         exposeSwaggerUI: true,
         exposeApiDocs: true,
         apiDocsPath: '/v1/openapi.json',
      },
      generateOpenAPIComponents(options),
   );
};
