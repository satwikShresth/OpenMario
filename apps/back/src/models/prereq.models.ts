import { z } from "zod";

// Parameter validation schema
export const PrereqParamsSchema = z.object({
  course_id: z.uuid("Invalid uuid"),
});

export type PrereqParams = z.infer<typeof PrereqParamsSchema>;

// Zod schema for the transformed response
export const PreReqCourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  subjectId: z.string(),
  courseNumber: z.string(),
});

export const PrerequisiteSchema = z.object({
  id: z.string(),
  relationshipType: z.string(),
  relationshipId: z.string().nullable(),
  canTakeConcurrent: z.boolean(),
  minimumGrade: z.string(),
  name: z.string(),
  subjectId: z.string(),
  courseNumber: z.string(),
});

export const GetPrereqResponseSchema = z.object({
  data: z.object({
    course: PreReqCourseSchema,
    prerequisites: z.array(z.array(PrerequisiteSchema)),
  }),
});

export type GetPrereqResponse = z.infer<typeof GetPrereqResponseSchema>;
