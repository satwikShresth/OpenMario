import {
  DescribeRouteBase,
  type DescribleRoute,
  ErrorResponseSchema,
  SuccessResponseSchema,
} from "#models";
import { createFactory } from "hono/factory";

export const DescribeGraphRoute = ({
  description,
  tags = ["Search"],
  responses = {},
}: DescribleRoute) =>
  DescribeRouteBase({
    description,
    tags,
    responses: {
      "200": {
        description: "Success",
        schema: SuccessResponseSchema,
      },
      "409": {
        description: "Database query failed",
        schema: ErrorResponseSchema,
      },
      ...responses,
    },
  });

export const factory = createFactory({
  defaultAppOptions: { strict: false },
});
