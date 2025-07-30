import { Hono } from "hono";
import graphPrereqRoutes from "./graph.prereq.routes.ts";
import graphCoursesRoutes from "./graph.courses.routes.ts";

export default () =>
  new Hono()
    .basePath("/graph")
    .get("/prereq/:course_id", ...graphPrereqRoutes)
    .get("/courses/:course_id", ...graphCoursesRoutes);
