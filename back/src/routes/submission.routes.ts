//routes/submission.routes.ts
import { Response, Router } from "express";
import { company, db, location, position, submission } from "#db";
import {
  JwtPayload,
  RequestParamsId,
  type SubmissionAggregate,
  SubmissionAggregateSchema,
  SubmissionAggregateUpdate,
  SubmissionAggregateUpdateSchema,
  SubmissionInsert,
  SubmissionMeIds,
  SubmissionMeIdsSchema,
  SubmissionQuery,
} from "#models";
import {
  validateUser,
  zodBodyValidator,
  zodQueryValidator,
} from "#/middleware/validation.middleware.ts";
import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { Request } from "express-jwt";

const getPositionId = async (insertData: SubmissionAggregate) =>
  await db
    .select({ position_id: position.id })
    .from(position)
    .innerJoin(company, eq(position.company_id, company.id))
    .where(
      and(
        eq(company.name, insertData.company),
        eq(position.name, insertData.position),
      ),
    )
    .limit(1)
    .then((values) => {
      const position_id = values[0]?.position_id!;
      if (!position_id) {
        throw new Error("Comapny or Position does not exist");
      }
      return position_id;
    })
    .catch(({ message }) => {
      throw new Error(message);
    });

const getLoationId = async (insertData: SubmissionAggregate) =>
  await db
    .select({ location_id: location.id })
    .from(location)
    .where(
      and(
        eq(location.city, insertData.location.split(",")[0].trim()),
        eq(location.state_code, insertData.location.split(",")[1].trim()),
      ),
    )
    .limit(1)
    .then((values) => {
      const location_id = values[0]?.location_id!;
      if (!location_id) throw new Error("Location does not exist");
      return location_id;
    })
    .catch(({ message }) => {
      console.log(message);
      throw new Error(message);
    });

export default () => {
  const router = Router();

  /**
   * GET /submissions
   * @summary Retrieve co-op submission records with pagination and filtering
   * @tags Submissions
   * @param {boolean} distinct.query - Query prarmer for filtering submission using company
   * @param {array<string>} company.query - Query prarmer for filtering submission using company
   * @param {array<string>} position.query - Query prarmer for filtering submission using position
   * @param {array<string>} location.query - Query prarmer for filtering submission using location
   * @param {array<string>} year.query - Query prarmer for filtering submission using year
   * @param {array<string>} coop_year.query - Query prarmer for filtering submission using coop_year
   * @param {array<string>} coop_cycle.query - Query prarmer for filtering submission using coop_cycle
   * @param {string} program_level.query - Query prarmer for filtering submission using program_level
   * @param {string} skip.query - Query prarmer for offeset
   * @param {string} limit.query - Query prarmer for limit
   * @return {array<SubmissionResponse>} 200 - Success response with paginated submissions
   * @example response - 200 - Example success response
   * {
   *   "skip": 0,
   *   "limit": 100,
   *   "data": [{
   *     "id": "123e4567-e89b-12d3-a456-426614174000",
   *     "year": 2024,
   *     "coop_year": "1st",
   *     "coop_cycle": "Fall/Winter",
   *     "program_level": "Undergraduate",
   *     "work_hours": 40,
   *     "compensation": 45000,
   *     "other_compensation": "Housing stipend",
   *     "details": "Full-stack development role",
   *     "company": "Tech Corp",
   *     "position": "Software Engineer",
   *     "location_city": "Boston",
   *     "location_state": "Massachusetts",
   *     "location_state_code": "MA"
   *   }]
   * }
   * @return {object} 409 - Error response
   * @example response - 409 - Example error response
   * {
   *   "message": "Failed to retrieve submissions"
   * }
   */
  router
    .route("/")
    .get(
      zodQueryValidator(SubmissionQuery),
      async (req: RequestParamsId, res: Response) => {
        const { distinct, skip, limit, query, pageIndex } = req?.validated
          ?.query as SubmissionQuery;

        const subQuerySelect = (distinct: boolean, schema: any) =>
          distinct
            ? db.selectDistinctOn(
                [
                  company.name,
                  position.name,
                  submission.compensation,
                  submission.program_level,
                ],
                schema,
              )
            : db.select(schema);

        const subQuery = subQuerySelect(!!distinct, {
          year: submission.year,
          coop_year: submission.coop_year,
          coop_cycle: submission.coop_cycle,
          program_level: submission.program_level,
          work_hours: submission.work_hours,
          compensation: submission.compensation,
          other_compensation: submission.other_compensation,
          details: submission.details,
          company: sql`${company.name}`.as("subQuery"),
          position: position.name,
          location_city: location.city,
          location_state: location.state,
          location_state_code: location.state_code,
        })
          .from(submission)
          .innerJoin(position, eq(submission.position_id, position.id))
          .innerJoin(location, eq(submission.location_id, location.id))
          .innerJoin(company, eq(position.company_id, company.id))
          .where(and(...(query?.filter(Boolean) || [])))
          .as("subQuery");

        const count = await db.$count(subQuery);

        return await db
          .select()
          .from(subQuery)
          .offset(skip!)
          .limit(limit!)
          .then((data) =>
            res.status(200).json({ pageIndex, pageSize: limit, count, data }),
          )
          .catch(({ message }) => res.status(409).json({ message }));
      },
    )
    /**
     * POST /submissions
     * @summary Create new co-op submission(s)
     * @tags Submissions
     * @security JWT
     * @param {SubmissionAggregate} request.body.required - Submission data
     * @return {object} 201 - Successfully created submission
     * @example response - 201 - Success response example
     * {
     *   "message": "Added positions successfully"
     * }
     * @return {object} 409 - Error response
     * @example response - 409 - Error response example
     * {
     *   "message": "Failed to add positions",
     *   "detail": "Company or Position does not exist"
     * }
     */
    .post(
      zodBodyValidator(SubmissionAggregateSchema),
      async (req: RequestParamsId, res: Response) => {
        const user_id = req?.auth?.user_id || null;
        const insertData = req?.validated?.body! as SubmissionAggregate;
        try {
          const toBeInserted: SubmissionInsert = {
            position_id: await getPositionId(insertData),
            location_id: await getLoationId(insertData),
            coop_cycle: insertData.coop_cycle,
            coop_year: insertData.coop_year,
            year: insertData.year,
            program_level: insertData.program_level,
            work_hours: insertData.work_hours,
            compensation: insertData.compensation,
            other_compensation: insertData.other_compensation,
            details: insertData.details,
            owner_id: user_id,
          };

          return await db
            .insert(submission)
            .values(toBeInserted)
            .returning()
            .then(([{ id, owner_id }]) =>
              res
                .status(201)
                .json({ id, owner_id, message: "Added position successfully" }),
            );
        } catch ({ message }) {
          return res.status(409).json({ message });
        }
      },
    )
    /**
     * PATCH /submissions
     * @summary Update an existing co-op submission
     * @tags Submissions
     * @security JWT
     * @param {SubmissionAggregateUpdate} request.body.required - Updated submission data including submission ID
     * @return {object} 201 - Successfully updated submission
     * @example response - 201 - Success response example
     * {
     *   "message": "Updated position successfully"
     * }
     * @return {object} 409 - Error response
     * @example response - 409 - Error response example
     * {
     *   "message": "Failed to update position",
     *   "detail": "Company or Position does not exist"
     * }
     */
    .patch(
      zodBodyValidator(SubmissionAggregateSchema),
      async (req: RequestParamsId, res: Response) => {
        const user_id = req?.auth?.user_id || null;
        const updateData = req?.validated?.body! as SubmissionAggregateUpdate;
        try {
          const toBeUpdated: SubmissionInsert = {
            id: updateData.id,
            position_id: await getPositionId(updateData),
            location_id: await getLoationId(updateData),
            coop_cycle: updateData.coop_cycle,
            coop_year: updateData.coop_year,
            year: updateData.year,
            program_level: updateData.program_level,
            work_hours: updateData.work_hours,
            compensation: updateData.compensation,
            other_compensation: updateData.other_compensation,
            details: updateData.details,
          };

          return await db
            .update(submission)
            .set(toBeUpdated)
            .where(
              and(
                eq(submission.id, toBeUpdated.id!),
                or(
                  isNull(submission.owner_id),
                  eq(submission.owner_id, user_id),
                ),
              ),
            )
            .returning()
            .then(() =>
              res
                .status(201)
                .json({ message: "Updated position successfully" }),
            );
        } catch ({ message }) {
          return res.status(409).json({ message });
        }
      },
    );

  /**
   * GET /submissions/me
   * @summary Retrieve all co-op submissions owned by the authenticated user
   * @tags Submissions
   * @security JWT
   * @param {array<string>} ids.query - Query prarmer for filtering submission using company
   * @return {array<SubmissionResponse>} 200 - Success response with user's submissions
   * @example response - 200 - Example success response
   * {
   *   "data": [{
   *     "year": 2024,
   *     "coop_year": "1st",
   *     "coop_cycle": "Fall/Winter",
   *     "program_level": "Undergraduate",
   *     "work_hours": 40,
   *     "compensation": 45000,
   *     "other_compensation": "Housing stipend",
   *     "details": "Full-stack development role",
   *     "company": "Tech Corp",
   *     "position": "Software Engineer",
   *     "location_city": "Boston",
   *     "location_state": "Massachusetts",
   *     "location_state_code": "MA"
   *   }]
   * }
   * @return {object} 409 - Error response
   * @example response - 409 - Example error response
   * {
   *   "message": "Failed to retrieve submissions"
   * }
   */
  router
    .route("/me")
    .all(validateUser)
    .get(
      zodQueryValidator(SubmissionMeIdsSchema),
      async (req: RequestParamsId, res: Response) => {
        const { ids } = req?.validated?.query as SubmissionMeIds;
        const { user_id } = req?.auth!;

        if (ids && ids?.length > 0) {
          await db
            .update(submission)
            .set({ owner_id: user_id })
            .where(
              and(inArray(submission.id, ids!), isNull(submission.owner_id)),
            );
        }

        return await db
          .select({
            id: submission.id,
            owner_id: submission.owner_id,
            year: submission.year,
            coop_year: submission.coop_year,
            coop_cycle: submission.coop_cycle,
            program_level: submission.program_level,
            work_hours: submission.work_hours,
            compensation: submission.compensation,
            other_compensation: submission.other_compensation,
            details: submission.details,
            company: company.name,
            position: position.name,
            location_city: location.city,
            location_state: location.state,
            location_state_code: location.state_code,
            location: sql`CONCAT(${location.city}, ', ', ${location.state_code})`,
          })
          .from(submission)
          .innerJoin(position, eq(submission.position_id, position.id))
          .innerJoin(location, eq(submission.location_id, location.id))
          .innerJoin(company, eq(position.company_id, company.id))
          .where(eq(submission.owner_id, user_id))
          .then((data) => res.status(200).json({ data }))
          .catch(({ message }) => res.status(409).json({ message }));
      },
    );

  return router;
};
