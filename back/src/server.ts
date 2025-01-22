import express, { NextFunction, Request, Response } from 'express';
import { debugMiddlewares } from '#utils';
import morgan from 'morgan';
import routes from '#routes';

const port = 3000;
const host = 'localhost';
const protocol = 'http';
export const app = express();

app.use(express.json());

app.use(morgan(':method :url :status :response-time ms'));

//debugMiddlewares(app);

app.use('/api/', routes());

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
