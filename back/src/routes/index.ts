import { Router } from 'express';
import submissionRoutes from '#/routes/submission.routes.ts';
import autocompleteRoutes from '#/routes/autocomplete.routes.ts';

export default () => {
   const router = Router();

   router.use('/submissions', submissionRoutes());
   router.use('/autocomplete', autocompleteRoutes());

   return router;
};
