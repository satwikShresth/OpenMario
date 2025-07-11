import { describeRoute } from "hono-openapi";
import { z } from "zod";

export const PaginationQuerySchema = z
  .object({
    skip: z.coerce.number().int().nonnegative().default(0),
    limit: z.coerce.number().int().min(1).max(100).default(100),
  })
  .meta({ id: "PaginationQuery" });

export type DescribleRoute = {
  description: string;
  tags?: string[];
  responses?: Record<
    string,
    {
      description?: string;
      schema?: z.ZodTypeAny;
    }
  >;
};

export const DescribeRouteBase = ({
  description,
  tags,
  responses,
}: DescribleRoute) =>
  describeRoute({
    description,
    tags,
    responses: Object?.entries(responses!)?.reduce(
      (acc, [code, res]) => ({
        ...acc,
        [code]: {
          description: res.description,
          ...(res.schema && {
            content: {
              "application/json": { schema: z.toJSONSchema(res.schema) },
            },
          }),
        },
      }),
      {},
    ),
  });

export const ErrorResponseSchema = z
  .object({
    message: z.string(),
  })
  .meta({ id: "ErrorResponse" });

export const SuccessResponseSchema = z
  .object({
    message: z.string(),
  })
  .meta({ id: "SuccessResponse" });

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
