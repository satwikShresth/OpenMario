//import OPENAPI_SPECS from '../../../openapi.json' with { type: 'json' };
import { Request } from 'express';
import morgan from 'morgan';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import { generateOpenAPI, options, registry } from '../../openapi/index.ts';

export const debugMiddlewares = (app: any) => {
   morgan.token('body', (req: Request) => JSON.stringify(req.body));
   morgan.token('query', (req: Request) => JSON.stringify(req.query));
   app.use(
      morgan(
         ':method :url :status :response-time ms\n{\nbody: :body\nquery: :query\n}',
      ),
   );

   expressJSDocSwagger(app)({
      ...options,
      baseDir: Deno.cwd(),
      filesPattern: './src/routes/*.routes.ts',
      swaggerUIPath: '/v1/docs',
      exposeSwaggerUI: true,
      exposeApiDocs: true,
      apiDocsPath: '/v1/openapi.json',
   }, generateOpenAPI(registry));

   //app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(OPENAPI_SPECS));
};
