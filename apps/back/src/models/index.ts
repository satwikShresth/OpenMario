import { z } from "zod/v4";
import { JwtPayload } from "#/models/auth.models.ts";

export type RequestParamsId = {
  params?: {
    id: number;
  };
  validated?: {
    body?: any;
    params?: any;
    query?: any;
  };
  auth?: JwtPayload;
};

export const paramsIdSchema = z
  .object({
    id: z.string(),
  })
  .meta({ id: "ParamsId" });

export type ParamsId = z.infer<typeof paramsIdSchema>;
export * from "#/models/enums.models.ts";
export * from "#/models/courses.models.ts";
export * from "#/models/prereq.models.ts";
export * from "#/models/autocomplete.models.ts";
export * from "#/models/users.models.ts";
export * from "#/models/auth.models.ts";
export * from "#/models/submissions.models.ts";
export * from "#/models/position.models.ts";
export * from "#/models/common.models.ts";
