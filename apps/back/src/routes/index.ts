import { Hono } from 'hono';
import submissionRoutes from '#/routes/submission.routes.ts';
import autocompleteRoutes from '#/routes/autocomplete.routes.ts';
import authRoutes from '#/routes/auth.routes.ts';
import comapnyPositionRoutes from '#/routes/comapny.position.routes.ts';

export default () => {
   const router = new Hono()
      .route('/', authRoutes())
      .route('/', comapnyPositionRoutes())
      .route('/', submissionRoutes())
      .route('/', autocompleteRoutes());

   return router;
};
