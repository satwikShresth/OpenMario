import { Router } from 'express';
import submissionRoutes from '#/routes/submission.routes.ts';

export default () => {
   const router = Router();

   router.use('/submissions', submissionRoutes());

   return router;
};
