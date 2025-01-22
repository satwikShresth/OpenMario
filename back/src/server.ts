import express, { NextFunction, Request, Response } from 'express';
import OPENAPI_SPECS from '../../openapi.json' with { type: 'json' };
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
import routes from '#routes';

const port = 3000;
const host = 'localhost';
const protocol = 'http';
export const app = express();

app.use(express.json());

////Debug
//morgan.token('body', (req: Request) => JSON.stringify(req.body));
//morgan.token('query', (req: Request) => JSON.stringify(req.query));
//app.use(
//   morgan(
//      ':method :url :status :response-time ms\n{\nbody: :body\nquery: :query\n}',
//   ),
//);
////Debug

//Non Debug
app.use(morgan(':method :url :status :response-time ms'));
//Non Debug
app.use('/api/', routes());

////Debug
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(OPENAPI_SPECS));
////Debug

app.use((req: Request, res: Response, next: NextFunction) => {
   const error = new Error(`Not Found: ${req.originalUrl}`);
   res.status(404);
   next(error);
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
   const status = res.statusCode >= 400 ? res.statusCode : 500;
   console.error(`Error: ${error.message}`);
   res.status(status).json({
      message: error.message,
   });
});

app.listen(port, host, () => {
   console.log(
      `🚀 Server running on ${protocol}://${host}:${port}✨`,
   );
});
