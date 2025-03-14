import { Router } from "express";
import submissionRoutes from "#/routes/submission.routes.ts";
import autocompleteRoutes from "#/routes/autocomplete.routes.ts";
import authRoutes from "#/routes/auth.routes.ts";
import comapnyPositionRoutes from "#/routes/comapny.position.routes.ts";

export default () => {
  const router = Router();

  router.use("/auth", authRoutes());
  router.use("/", comapnyPositionRoutes());
  router.use("/submissions", submissionRoutes());
  router.use("/autocomplete", autocompleteRoutes());

  return router;
};
