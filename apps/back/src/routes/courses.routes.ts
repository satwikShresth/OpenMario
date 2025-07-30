import { Hono } from "hono";
import { validator as zValidator } from "hono-openapi/zod";
import { neo4jService } from "#/services/neo4j.service.ts";
import {
  PrereqParamsSchema,
  type PrereqParams,
  type DescribleRoute,
  DescribeRouteBase,
  ErrorResponseSchema,
  SuccessResponseSchema,
  GetCourseResponseSchema,
  type Course,
} from "#models";
import Cypher from "@neo4j/cypher-builder";

const DescribeCourseRoute = ({
  description,
  tags = ["Courses"],
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

export default () => {
  const router = new Hono().basePath("/courses");

  /**
   * GET /{course_id}
   * Retrieve all attributes for a specific course
   */
  router.get(
    "/:course_id",
    DescribeCourseRoute({
      description: "Retrieve all attributes for a specific course",
      responses: {
        "200": {
          description: "Course data with all attributes",
          schema: GetCourseResponseSchema,
        },
        "404": {
          description: "Course not found",
        },
      },
    }),
    zValidator("param", PrereqParamsSchema),
    async (c) => {
      const { course_id } = c.req.valid("param") as PrereqParams;
      const course = new Cypher.Node();

      // Build the query to get all course properties
      const { cypher, params } = new Cypher.Match(
        new Cypher.Pattern(course, { labels: ["Course"] }),
      )
        .where(Cypher.eq(course.property("id"), new Cypher.Param(course_id)))
        .return(
          [course.property("id"), "id"],
          [course.property("subject_id"), "subject_id"],
          [course.property("course_number"), "course_number"],
          [course.property("title"), "title"],
          [course.property("description"), "description"],
          [course.property("credits"), "credits"],
          [course.property("writing_intensive"), "writing_intensive"],
          [course.property("repeat_status"), "repeat_status"],
        )
        .build();

      return await neo4jService
        .executeReadQuery(cypher, params)
        .then((records) => {
          if (records.length === 0) {
            return c.json({ message: "Course not found" }, 404);
          }

          const record = records[0];
          const courseData: Course = {
            id: record.get("id"),
            subject_id: record.get("subject_id"),
            course_number: record.get("course_number"),
            title: record.get("title"),
            description: record.get("description"),
            credits: record.get("credits"),
            writing_intensive: record.get("writing_intensive"),
            repeat_status: record.get("repeat_status"),
          };

          return c.json({ data: courseData }, 200);
        })
        .catch((error) => {
          console.error("Error fetching course:", error);
          return c.json({ message: error.message }, 500);
        });
    },
  );

  return router;
};
