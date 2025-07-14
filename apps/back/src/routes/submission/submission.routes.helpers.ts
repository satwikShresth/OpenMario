import {
  DescribeRouteBase,
  type DescribleRoute,
  ErrorResponseSchema,
  querySQL,
  type SubmissionAggregate,
  SubmissionListResponseSchema,
  type SubmissionQuery,
} from "#models";
import { company, db, location, position, submission } from "#db";
import { and, eq, or, type SQL } from "drizzle-orm";

export const DescribeSubmissionRoute = ({
  description,
  tags = ["Submissions"],
  responses = {},
}: DescribleRoute) =>
  DescribeRouteBase({
    description,
    tags,
    responses: {
      "200": {
        description: "Success",
        schema: SubmissionListResponseSchema,
      },
      "409": {
        description: "Error response",
        schema: ErrorResponseSchema,
      },
      ...responses,
    },
  });

export const getPositionId = async (insertData: SubmissionAggregate) =>
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
        throw new Error("Company or Position does not exist");
      }
      return position_id;
    })
    .catch(({ message }) => {
      throw new Error(message);
    });

export const getLoationId = async (insertData: SubmissionAggregate) =>
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

export const transformQuery = (
  query: SubmissionQuery,
): {
  companyQuery?: SQL[];
  positionQuery?: SQL[];
  query?: SQL[];
  pageIndex?: number;
  skip?: number;
  limit?: number;
  distinct?: boolean;
} => {
  const queries: SQL[] = [];

  const companyQueries: SQL[] | undefined = query?.company?.map((companyName) =>
    eq(company.name, companyName),
  );
  if (companyQueries?.length!) {
    queries.push(or(...companyQueries)!);
  }

  const positionQueries = query?.position?.map((position_) =>
    querySQL(position.name, position_),
  );
  if (positionQueries?.length) {
    queries.push(or(...positionQueries)!);
  }

  // Location queries
  const locationQueries = query?.location?.map((loc) =>
    and(
      eq(location.city, loc.split(", ")[0]),
      eq(location.state_code, loc.split(", ")[1]),
    ),
  );
  if (locationQueries?.length) {
    queries.push(or(...locationQueries)!);
  }

  const range = (start: number, end: number) => {
    if (start === end) {
      return [start];
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const yearQueries =
    query?.year &&
    range(query?.year[0], query?.year[1])?.map((year) =>
      eq(submission.year, year),
    );

  if (yearQueries?.length) {
    queries.push(or(...yearQueries)!);
  }

  // Coop year queries
  const coopYearQueries = query?.coop_year?.map((coop_year) =>
    eq(submission.coop_year, coop_year),
  );
  if (coopYearQueries?.length) {
    queries.push(or(...coopYearQueries)!);
  }

  // Coop cycle queries
  const coopCycleQueries = query?.coop_cycle?.map((coop_cycle) =>
    eq(submission.coop_cycle, coop_cycle),
  );
  if (coopCycleQueries?.length) {
    queries.push(or(...coopCycleQueries)!);
  }

  // Program level query
  if (query?.program_level) {
    queries.push(eq(submission.program_level, query.program_level));
  }

  return {
    query: queries,
    pageIndex: query?.pageIndex,
    skip: query?.pageIndex! * query?.pageSize! || 0,
    limit: query?.pageSize ?? 10,
    distinct: !!query?.distinct,
  };
};
