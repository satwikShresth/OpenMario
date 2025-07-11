import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { and, eq, or, sql } from "drizzle-orm";
import { company, db, location, position } from "#db";
import { orderSQL, querySQL } from "#models";
import {
  DescribeRouteBase,
  DescribleRoute,
  ErrorResponseSchema,
} from "#models";

// Define response schemas for autocomplete routes
const CompanyResultSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .meta({ id: "CompanyResult" });

const PositionResultSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .meta({ id: "PositionResult" });

const LocationResultSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .meta({ id: "LocationResult" });

const CompanyListResponseSchema = z
  .array(CompanyResultSchema)
  .meta({ id: "CompanyListResponse" });
const PositionListResponseSchema = z.array(PositionResultSchema).meta({
  id: "PositionListResponse",
});
const LocationListResponseSchema = z.array(LocationResultSchema).meta({
  id: "LocationListResponse",
});

// Single helper function for all autocomplete route descriptions
const DescribeAutocompleteRoute = ({
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
        schema: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
          }),
        ),
      },
      "409": {
        description: "Database query failed",
        schema: ErrorResponseSchema,
      },
      ...responses,
    },
  });

const queryStringPreprocess = () =>
  z.preprocess(
    (name) =>
      String(name)
        .trim()
        .replace(/[^a-zA-Z\s]/g, ""),
    z.string("Need to have a query").min(3, "Should have minimum 3 characters"),
  );

export default () => {
  const router = new Hono().basePath("/autocomplete");
  const limit = 25;

  /**
   * GET /autocomplete/company
   * Search for companies by name with fuzzy matching
   */
  router.get(
    "/company",
    DescribeAutocompleteRoute({
      description: "Search for companies by name with fuzzy matching",
      responses: {
        "200": {
          description: "List of matching company names",
          schema: CompanyListResponseSchema,
        },
      },
    }),
    zValidator(
      "query",
      z
        .object({ comp: queryStringPreprocess() })
        .transform(({ comp }: { comp: string }) => ({
          query: querySQL(company.name, comp),
          order: orderSQL(company.name, comp),
        })),
    ),
    async (c) => {
      const { query, order } = c.req.valid("query");

      return await db
        .select({ id: company.id, name: company.name })
        .from(company)
        .where(query)
        //@ts-ignore: I duuno why
        .orderBy(order)
        .limit(limit)
        .then((results) => c.json(results, 200))
        .catch(({ message }) => c.json({ message }, 409));
    },
  );

  /**
   * GET /autocomplete/position
   * Search for positions within a specific company
   */
  router.get(
    "/position",
    DescribeAutocompleteRoute({
      description: "Search for positions within a specific company",
      responses: {
        "200": {
          description: "List of matching position titles",
          schema: PositionListResponseSchema,
        },
      },
    }),
    zValidator(
      "query",
      z
        .object({
          comp: z.string("Company Name is Required"),
          pos: z.preprocess(
            (name) =>
              name &&
              String(name)
                .trim()
                .replace(/[^a-zA-Z\s]/g, ""),
            z.string().min(3, "Should have minimum 3 characters").optional(),
          ),
        })
        .transform(({ comp, pos }) => ({
          queries: [
            comp !== "*" ? eq(company.name, comp.trim()) : undefined,
            querySQL(position.name, pos),
          ],
          order: orderSQL(position.name, pos),
        })),
    ),
    async (c) => {
      const { queries } = c.req.valid("query");

      return await db
        .selectDistinctOn([position.name], {
          id: position.id,
          name: position.name,
        })
        .from(position)
        .innerJoin(company, eq(position.company_id, company.id))
        .where(and(...queries))
        .limit(limit)
        .then((results) => c.json(results, 200))
        .catch(({ message }) => c.json({ message }, 409));
    },
  );

  /**
   * GET /autocomplete/location
   * Search for locations with fuzzy matching across city, state, and state code
   */
  router.get(
    "/location",
    DescribeAutocompleteRoute({
      description:
        "Search for locations with fuzzy matching across city, state, and state code",
      responses: {
        "200": {
          description:
            'List of matching locations in "City, State_Code" format',
          schema: LocationListResponseSchema,
        },
      },
    }),
    zValidator(
      "query",
      z.object({ loc: queryStringPreprocess() }).transform(({ loc }) => ({
        queries: [
          querySQL(location.city, loc),
          querySQL(location.state, loc),
          querySQL(location.state_code, loc),
        ],
        order: sql`GREATEST(
               similarity(${location.city}, ${loc.trim()}),
               similarity(${location.state}, ${loc.trim()}),
               similarity(${location.state_code}, ${loc.trim()})
               ) DESC`,
      })),
    ),
    async (c) => {
      const { queries, order } = c.req.valid("query");

      return await db
        .select()
        .from(location)
        .where(or(...queries))
        .limit(limit)
        .orderBy(order)
        .then((results) =>
          c.json(
            results.map((item) => ({
              id: item.id,
              name: `${item.city}, ${item.state_code}`,
            })),
            200,
          )
        )
        .catch(({ message }) => c.json({ message }, 409));
    },
  );

  return router;
};
