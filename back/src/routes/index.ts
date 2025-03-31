import { Hono } from 'hono';
import submissionRoutes from '#/routes/submission.routes.ts';
import autocompleteRoutes from '#/routes/autocomplete.routes.ts';
import authRoutes from '#/routes/auth.routes.ts';
import comapnyPositionRoutes from '#/routes/comapny.position.routes.ts';

export default () => {
   const router = new Hono();

   // Mount sub-routes
   // Note: This assumes your route files will be converted to return Hono routers
   router.route('/auth', authRoutes());
   router.route('/', comapnyPositionRoutes());
   router.route('/submissions', submissionRoutes());
   router.route('/autocomplete', autocompleteRoutes());

   return router;
};
