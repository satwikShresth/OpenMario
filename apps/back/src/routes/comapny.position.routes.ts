import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CompanyPositionInsertSchema, CompanyPostionInsert } from "#models";
import { company, db, position } from "#db";
import { and, eq, or, sql } from "drizzle-orm";
import {
  DescribeRouteBase,
  DescribleRoute,
  ErrorResponseSchema,
} from "#models";

const CompanyPositionItemSchema = z
  .object({
    company_id: z.string().nullable(),
    position_id: z.string().nullable(),
    company_name: z.string(),
    position_name: z.string(),
  })
  .meta({ id: "CompanyPositionItem" });

const CompanyPositionListResponseSchema = z
  .object({
    data: z.array(CompanyPositionItemSchema),
  })
  .meta({ id: "CompanyPositionListResponse" });

const CompanyPositionCreateResponseSchema = z
  .object({
    company_id: z.string(),
    position_id: z.string(),
    message: z.string(),
  })
  .meta({ id: "CompanyPositionCreateResponse" });

// Single helper function for all company-position route descriptions
const DescribeCompanyPositionRoute = ({
  description,
  tags = ["Companies and Positions"],
  responses = {},
}: DescribleRoute) =>
  DescribeRouteBase({
    description,
    tags,
    responses: {
      "200": {
        description: "Success",
        schema: CompanyPositionListResponseSchema,
      },
      "409": {
        description: "Error response",
        schema: ErrorResponseSchema,
      },
      ...responses,
    },
  });

export default () => {
  const router = new Hono();

  /**
   * GET /company-position
   * Retrieve companies and positions owned by the authenticated user
   */
  router.get(
    "/company-position",
    DescribeCompanyPositionRoute({
      description:
        "Retrieve companies and positions owned by the authenticated user",
      responses: {
        "200": {
          description: "Success response with user's companies and positions",
          schema: CompanyPositionListResponseSchema,
        },
      },
    }),
    async (c) => {
      const user_id = c.get("jwtPayload")?.user_id;

      return await db
        .select({
          company_id:
            sql`CASE WHEN ${position.owner_id} = ${user_id} THEN ${company.id} ELSE NULL END`,
          position_id:
            sql`CASE WHEN ${position.owner_id} = ${user_id} THEN ${position.id} ELSE NULL END`,
          company_name: company.name,
          position_name: position.name,
        })
        .from(position)
        .innerJoin(company, eq(position.company_id, company.id))
        .where(
          or(eq(position.owner_id, user_id), eq(company.owner_id, user_id)),
        )
        .then((data) => c.json({ data }, 200))
        .catch(({ message }) => c.json({ message }, 409));
    },
  );

  /**
   * POST /company-position
   * Create a new company and position pair
   */
  router.post(
    "/company-position",
    DescribeCompanyPositionRoute({
      description: "Create a new company and position pair",
      responses: {
        "201": {
          description: "Successfully created company and position",
          schema: CompanyPositionCreateResponseSchema,
        },
        "409": {
          description:
            "Error response - position already exists or creation failed",
          schema: ErrorResponseSchema,
        },
      },
    }),
    zValidator("json", CompanyPositionInsertSchema),
    async (c) => {
      const user_id = c.get("jwtPayload")?.user_id || null;
      const { company_name, position_name } = c.req.valid(
        "json",
      ) as CompanyPostionInsert;

      // Get or create company
      return await db
        .select({ id: company.id })
        .from(company)
        .where(eq(company.name, company_name))
        .then(async (existingCompanies) => {
          if (existingCompanies.length > 0) {
            return existingCompanies[0].id;
          }

          return await db
            .insert(company)
            .values({ name: company_name, owner_id: user_id })
            .returning({ id: company.id })
            .then(([{ id }]) => id);
        })
        .then(async (company_id) => {
          // Check if position already exists
          return await db
            .select({ id: position.id })
            .from(position)
            .where(
              and(
                eq(position.name, position_name),
                eq(position.company_id, company_id),
              ),
            )
            .then(async (existingPositions) => {
              if (existingPositions.length > 0) {
                return c.json({ message: "Position Already Exists" }, 409);
              }

              // Create new position
              return await db
                .insert(position)
                .values({
                  name: position_name,
                  company_id,
                  owner_id: user_id,
                })
                .returning({ id: position.id })
                .then(([{ id }]) =>
                  c.json(
                    {
                      company_id,
                      position_id: id,
                      message: "Added Position Successfully",
                    },
                    201,
                  )
                );
            });
        })
        .catch((error) => {
          console.log(`Error:${error}`);
          return c.json(
            {
              message: `Error: ${error?.message || "Unknown error"}`,
            },
            409,
          );
        });
    },
  );

  return router;
};
