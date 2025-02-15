import { Router } from 'express';
import authRoutes from './auth.routes.ts';
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

   return router;
};
