import { Router } from 'express';
import booksRoutes from './books.routes.ts';
import authorsRoutes from './authors.routes.ts';

export default () => {
   const router = Router();

   router.use('/books', booksRoutes());
   router.use('/authors', authorsRoutes());

   return router;
};
