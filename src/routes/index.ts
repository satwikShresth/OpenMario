import { Router } from 'express';
//import bookRoutes from './books.route.js';
import authorRoutes from './author.routes.ts';

export default () => {
   const router = Router();

   //router.use("/books", bookRoutes());
   router.use('/authors', authorRoutes());

   return router;
};
