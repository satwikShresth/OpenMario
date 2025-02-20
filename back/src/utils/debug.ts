//import OPENAPI_SPECS from '../../../openapi.json' with { type: 'json' };
import { Request } from 'express';
//import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';

export const debugMiddlewares = (app: any) => {
   morgan.token('body', (req: Request) => JSON.stringify(req.body));
   morgan.token('query', (req: Request) => JSON.stringify(req.query));
   app.use(
      morgan(
         ':method :url :status :response-time ms\n{\nbody: :body\nquery: :query\n}',
      ),
   );

   //app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(OPENAPI_SPECS));
};
