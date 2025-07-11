import { Context, Next } from "hono";

export const validateUser = (c: Context, next: Next) => {
  if (c.get("jwtPayload")) {
    return next();
  }

  return c.json({ message: "Unauthorized Access" }, 401);
};
