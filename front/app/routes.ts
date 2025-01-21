import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("authors", "./routes/authors.tsx"),
  route("books", "./routes/books.tsx"),
] satisfies RouteConfig;

