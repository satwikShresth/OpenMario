import express, { NextFunction, Request, Response } from 'express';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
//import { debugMiddlewares } from '#utils';
import morgan from 'morgan';
import routes from '#routes';
import { db } from '#db';
import { revoked } from '#/db/schema.ts';
import { eq } from 'drizzle-orm';

const port = 3000;
const host = '0.0.0.0';
const protocol = 'http';
export const app = express();

app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));

//debugMiddlewares(app);

app.use(
   '/v1',
   expressjwt({
      secret: 'Your-Secreat-Here',
      algorithms: ['HS256'],
      credentialsRequired: false,
      isRevoked: async (_req: Request, token): Promise<boolean> => {
         return await db
            .select()
            .from(revoked)
            //@ts-ignore: its not type checking the jwtpaylod
            .where(eq(revoked.signature, token?.payload?.jid!))
            .then((signatures) => signatures[0]?.signature !== undefined)
            .catch((_) => false);
      },
   })
      .unless({
         path: ['/api/signup', '/api/access-token'],
      }),
   routes(),
);

app.use((req: Request, res: Response, next: NextFunction) => {
   const error = new Error(`Not Found: ${req.originalUrl}`);
   res.status(404);
   next(error);
});

app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
   if (error.name === 'UnauthorizedError') {
      res.status(401).send('invalid token...');
   } else {
      next(error);
   }
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
