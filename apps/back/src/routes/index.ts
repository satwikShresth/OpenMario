import { Hono } from "hono";
import submissionRoutes from "#/routes/submission/index.ts";
import autocompleteRoutes from "#/routes/autocomplete.routes.ts";
import authRoutes from "#/routes/auth.routes.ts";
import comapnyPositionRoutes from "#/routes/comapny.position.routes.ts";
import graphRoutes from "#/routes/graph/index.ts";

export default () => {
  const router = new Hono()
    .route("/", graphRoutes())
    .route("/", authRoutes())
    .route("/", comapnyPositionRoutes())
    .route("/", submissionRoutes())
    .route("/", autocompleteRoutes());

  return router;
};
