import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("routes/protected/layout.tsx", [
    index("routes/protected/home.tsx"),
    route("book", "routes/protected/book.tsx"),
    route("author", "routes/protected/author.tsx"),
  ]),

  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),
] satisfies RouteConfig;

