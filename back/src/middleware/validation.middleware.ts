import { NextFunction, Request, Response } from "express";
import { formatZodError } from "#utils";
import { RequestParamsId } from "#models";
import { db } from "#db";
import { eq } from "drizzle-orm";

const zodValidator =
  (method: "query" | "body" | "params", schema: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req[method]);

    if (!result.success) {
      console.error(formatZodError(result.error).error);
      return res.status(400).send({
        type: method,
        errors: formatZodError(result.error).error,
      });
    }

    if (req.validated === undefined) {
      req.validated = {};
    }

    req.validated[method] = result.data;
    return next();
  };

export const zodBodyValidator = (schema: any) => zodValidator("body", schema);

export const zodQueryValidator = (schema: any) => zodValidator("query", schema);

export const zodParamsValidator = (schema: any) =>
  zodValidator("params", schema);

export const validateOwner =
  (table: any) =>
  async (req: RequestParamsId, res: Response, next: NextFunction) => {
    const current_user_id = req?.auth?.user_id!;
    const item_id = req.validated?.params?.id!;

    return await db
      .select({ user_id: table?.user_id! })
      .from(table)
      .where(eq(table.id, item_id))
      .then((result) => result[0].user_id === current_user_id)
      .then((result) =>
        result
          ? next()
          : res.status(401).json({ message: "Unauthorized Access" }),
      )
      .catch(({ message }) => {
        res.status(404).json({ message, detail: `Item not found` });
      });
  };
export const validateUser = (
  req: RequestParamsId,
  res: Response,
  next: NextFunction,
) => {
  console.log("passing");
  console.log(req?.auth);
  return req?.auth
    ? next()
    : res.status(401).json({ message: "Unauthorized Access" });
};
