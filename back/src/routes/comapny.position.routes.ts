import { Response, Router } from "express";
import {
  CompanyPositionInsertSchema,
  CompanyPostionInsert,
  CompanyUpdate,
  CompanyUpdateSchema,
  PositionUpdate,
  PositionUpdateSchema,
  RequestParamsId,
} from "#models";
import { company, db, position } from "#db";
import { and, eq, or, sql } from "drizzle-orm";
import {
  validateUser,
  zodBodyValidator,
} from "#/middleware/validation.middleware.ts";

export default () => {
  const router = Router();

  /**
   * GET /company-position
   * @summary Retrieve companies and positions owned by the authenticated user
   * @tags Companies and Positions
   * @security JWT
   * @return {object} 200 - Success response with user's companies and positions
   * @example response - 200 - Example success response
   * {
   *   "data": [{
   *     "company_id": "123e4567-e89b-12d3-a456-426614174000",
   *     "position_id": "123e4567-e89b-12d3-a456-426614174001",
   *     "company_name": "Tech Corp",
   *     "position_name": "Software Engineer"
   *   }]
   * }
   * @return {object} 409 - Error response
   * @example response - 409 - Example error response
   * {
   *   "message": "Failed to retrieve companies and positions"
   * }
   */
  router
    .route("/company-position")
    .get(validateUser, async (req: RequestParamsId, res: Response) => {
      const { user_id } = req?.auth!;

      return await db
        .select({
          company_id: sql`CASE WHEN ${position.owner_id} = ${user_id} THEN ${company.id} ELSE NULL END`,
          position_id: sql`CASE WHEN ${position.owner_id} = ${user_id} THEN ${position.id} ELSE NULL END`,
          company_name: company.name,
          position_name: position.name,
        })
        .from(position)
        .innerJoin(company, eq(position.company_id, company.id))
        .where(
          or(eq(position.owner_id, user_id), eq(company.owner_id, user_id)),
        )
        .then((data) => res.status(200).json({ data }))
        .catch(({ message }) => res.status(409).json({ message }));
    })
    /**
     * POST /company-position
     * @summary Create a new company and position pair
     * @tags Companies and Positions
     * @security JWT
     * @param {CompanyPositionInsert} request.body.required - Company and position data
     * @return {object} 201 - Successfully created company and position
     * @example request - Example request body
     * {
     *   "company_name": "New Tech Corp",
     *   "position_name": "Frontend Developer"
     * }
     * @example response - 201 - Success response example
     * {
     *   "company_id": "123e4567-e89b-12d3-a456-426614174000",
     *   "position_id": "123e4567-e89b-12d3-a456-426614174001",
     *   "message": "Added Postion Successfully"
     * }
     * @return {object} 409 - Error response
     * @example response - 409 - Error response example when position already exists
     * {
     *   "message": "Position Already Exists"
     * }
     * @example response - 409 - Other error response example
     * {
     *   "message": "Error: Failed to create company or position"
     * }
     */
    .post(
      zodBodyValidator(CompanyPositionInsertSchema),
      async (req: RequestParamsId, res: Response) => {
        const user_id = req?.auth?.user_id || null;
        const { company_name, position_name } = req?.validated
          ?.body! as CompanyPostionInsert;

        try {
          const company_id = await db
            .select({ id: company.id })
            .from(company)
            .where(eq(company.name, company_name))
            .then(async ([existingCompany]) =>
              existingCompany
                ? existingCompany.id
                : await db
                    .insert(company)
                    .values({ name: company_name, owner_id: user_id })
                    .returning({
                      id: company.id,
                      owner: sql`CASE WHEN ${company.owner_id} = ${user_id} THEN true ELSE false END`,
                    })
                    .then(([{ id, owner }]) => ({ id, owner })),
            );

          return await db
            .select({ id: position.id })
            .from(position)
            .where(
              and(
                eq(position.name, position_name),
                eq(position.company_id, company_id),
              ),
            )
            .then(async ([existingCompany]) =>
              existingCompany
                ? res.status(409).json({ message: "Position Already Exists" })
                : await db
                    .insert(position)
                    .values({
                      name: position_name,
                      company_id,
                      owner_id: user_id,
                    })
                    .returning({ id: company.id })
                    .then(([{ id }]) => id)
                    .then((id) =>
                      res.status(201).json({
                        company_id,
                        position_id: id,
                        message: "Added Postion Successfully",
                      }),
                    ),
            );
        } catch (error: any) {
          console.log(`Error:${error}`);
          return res.status(409).json({ message: `Error: ${error?.message!}` });
        }
      },
    );

  /**
   * PATCH /company
   * @summary Update an existing company name
   * @tags Companies and Positions
   * @security JWT
   * @param {CompanyUpdate} request.body.required - Updated company data including company ID
   * @return {object} 204 - Successfully updated company
   * @example request - Example request body
   * {
   *   "company_id": "123e4567-e89b-12d3-a456-426614174000",
   *   "company_name": "Updated Tech Corp"
   * }
   * @example response - 204 - Success response example
   * {
   *   "data": [{
   *     "id": "123e4567-e89b-12d3-a456-426614174000",
   *     "name": "Updated Tech Corp",
   *     "owner_id": "user-uuid-here"
   *   }],
   *   "message": "Updated Comapny Successfully"
   * }
   * @return {object} 409 - Error response
   * @example response - 409 - Error response example
   * {
   *   "message": "Error: Failed to update company"
   * }
   */
  router.patch(
    "/company",
    zodBodyValidator(CompanyUpdateSchema),
    async (req: RequestParamsId, res: Response) => {
      const { user_id = null } = req?.auth!;
      const { company_name, company_id } = req?.validated
        ?.body! as CompanyUpdate;

      return await db
        .update(company)
        .set({ name: company_name })
        .where(and(eq(company.owner_id, user_id), eq(company.id, company_id)))
        .returning()
        .then((data) =>
          res
            .status(204)
            .json({ data, message: `Updated Comapny Successfully` }),
        )
        .catch((error) => {
          console.log(`Error:${error}`);
          return res.status(409).json({ message: `Error: ${error?.message!}` });
        });
    },
  );

  /**
   * PATCH /position
   * @summary Update an existing position name
   * @tags Companies and Positions
   * @security JWT
   * @param {PositionUpdate} request.body.required - Updated position data including position ID
   * @return {object} 204 - Successfully updated position
   * @example request - Example request body
   * {
   *   "position_id": "123e4567-e89b-12d3-a456-426614174001",
   *   "position_name": "Senior Frontend Developer"
   * }
   * @example response - 204 - Success response example
   * {
   *   "data": [{
   *     "id": "123e4567-e89b-12d3-a456-426614174001",
   *     "name": "Senior Frontend Developer",
   *     "company_id": "123e4567-e89b-12d3-a456-426614174000",
   *     "owner_id": "user-uuid-here"
   *   }],
   *   "message": "Updated Position Successfully"
   * }
   * @return {object} 409 - Error response
   * @example response - 409 - Error response example
   * {
   *   "message": "Error: Failed to update position"
   * }
   */
  router.patch(
    "/position",
    zodBodyValidator(PositionUpdateSchema),
    async (req: RequestParamsId, res: Response) => {
      const { user_id = null } = req?.auth!;
      const { position_name, position_id } = req?.validated
        ?.body! as PositionUpdate;

      return await db
        .update(position)
        .set({ name: position_name })
        .where(
          and(eq(position.owner_id, user_id), eq(position.id, position_id)),
        )
        .returning()
        .then((data) =>
          res.status(204).json({
            data,
            message: `Updated Position Successfully`,
          }),
        )
        .catch((error) => {
          console.log(`Error:${error}`);
          return res.status(409).json({ message: `Error: ${error?.message!}` });
        });
    },
  );

  return router;
};
