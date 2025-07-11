import { HonoBase } from "hono/hono-base";
import { openAPISpecs } from "hono-openapi";

const options = {
  documentation: {
    info: {
      title: "Inspiration",
      version: "1.0.0",
      description: "API Documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
  },
};

export const devHook = (app: any, routes: any) =>
  app.get("/openapi", openAPISpecs(routes, options));
