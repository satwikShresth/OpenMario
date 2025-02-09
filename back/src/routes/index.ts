import { Router } from 'express';
import booksRoutes from './books.routes.ts';
import authRoutes from './auth.routes.ts';
import authorsRoutes from './authors.routes.ts';

export default () => {
   const router = Router();

   router.use('/', authRoutes());
   router.use('/books', booksRoutes());
   router.use('/authors', authorsRoutes());

   return router;
};
