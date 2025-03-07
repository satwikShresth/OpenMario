import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("routes/protected/layout.tsx", [
    index("routes/protected/home.tsx"),
    route("home", "routes/protected/table.tsx"),
    route("submissions", "routes/protected/submission.tsx"),
    route("form", "routes/protected/form.tsx"),
  ]),

  //route("login", "routes/auth/login.tsx"),
  //route("register", "routes/auth/register.tsx"),
] satisfies RouteConfig;

