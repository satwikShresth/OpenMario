import express, { NextFunction, Request, Response } from 'express';
import { debugMiddlewares } from '#utils';
import morgan from 'morgan';
import routes from '#routes';
import { JWT_CLIENT_SECRET as secret } from '#/config/index.ts';
import { expressjwt } from 'express-jwt';

const port = 3000;
const host = '0.0.0.0';
const protocol = 'http';
const app = express();

app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));
app.set('trust proxy', 'loopback, linklocal, uniquelocal');
debugMiddlewares(app);

app.use(
   '/v1',
   expressjwt({
      secret,
      algorithms: ['HS256'],
      credentialsRequired: false,
   }),
   routes(),
);

app.use((req: Request, res: Response, next: NextFunction) => {
   const error = new Error(`Not Found: ${req.originalUrl}`);
   res.status(404);
   next(error);
});

app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
   console.error(`Error: ${error}`);
   return error.name === 'UnauthorizedError'
      ? res.status(401).send('invalid token...')
      : next(error);
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
   const status = res.statusCode >= 400 ? res.statusCode : 500;
   console.error(`Error: ${error.message}`);
   res.status(status).json({ message: error.message });
});

app.listen(port, host, () => {
   console.log(`🚀 Server running on ${protocol}://${host}:${port}✨`);
});
