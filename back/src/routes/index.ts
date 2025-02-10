import { Router } from 'express';
import booksRoutes from './books.routes.ts';
import authRoutes from './auth.routes.ts';
import authorsRoutes from './authors.routes.ts';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
   windowMs: 60 * 60 * 1000, // 1 hour
   max: 5, // Limit each IP to 5 requests per windowMs
   message: 'Too many authentication attempts, please try again later',
   standardHeaders: true,
   legacyHeaders: false,
});

const apiLimiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 50, // Limit each IP to 50 requests per windowMs
   message: 'Too many API requests from this IP, please try again later',
   standardHeaders: true,
   legacyHeaders: false,
});

export default () => {
   const router = Router();

   router.use('/', authLimiter, authRoutes());
   router.use('/books', apiLimiter, booksRoutes());
   router.use('/authors', apiLimiter, authorsRoutes());

   return router;
};
