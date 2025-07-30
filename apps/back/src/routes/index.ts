import { Hono } from "hono";
import submissionRoutes from "#/routes/submission/index.ts";
import autocompleteRoutes from "#/routes/autocomplete.routes.ts";
import authRoutes from "#/routes/auth.routes.ts";
import comapnyPositionRoutes from "#/routes/comapny.position.routes.ts";
import prereqRoutes from "./prereq.routes.ts";
import coursesRoutes from "./courses.routes.ts";

export default () => {
  const router = new Hono()
    .route("/", prereqRoutes())
    .route("/", coursesRoutes())
    .route("/", authRoutes())
    .route("/", comapnyPositionRoutes())
    .route("/", submissionRoutes())
    .route("/", autocompleteRoutes());

  return router;
};
