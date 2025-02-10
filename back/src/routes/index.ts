import { Router } from 'express';
import booksRoutes from './books.routes.ts';
import authRoutes from './auth.routes.ts';
import authorsRoutes from './authors.routes.ts';
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
   windowMs: 2 * 60 * 1000,
   max: 50,
   message: 'Too many API requests from this IP, please try again later',
   standardHeaders: true,
   legacyHeaders: false,
});

const genLimiter = rateLimit({
   windowMs: 2 * 60 * 1000,
   max: 100,
   message: 'Too many API requests from this IP, please try again later',
   standardHeaders: true,
   legacyHeaders: false,
});

const genLimiter2 = rateLimit({
   windowMs: 2 * 60 * 1000,
   max: 100,
   message: 'Too many API requests from this IP, please try again later',
   standardHeaders: true,
   legacyHeaders: false,
});

export default () => {
   const router = Router();

   router.use('/', apiLimiter, authRoutes());
   router.use('/books', genLimiter, booksRoutes());
   router.use('/authors', genLimiter2, authorsRoutes());

   return router;
};
