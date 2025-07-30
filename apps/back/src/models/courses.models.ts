import { z } from "zod";

// Course response schema
export const CourseSchema = z.object({
  id: z.uuid(),
  subject_id: z.string(),
  course_number: z.string(),
  title: z.string(),
  description: z.string(),
  credits: z.number(),
  writing_intensive: z.boolean(),
  repeat_status: z.string(),
});

// API response wrapper
export const GetCourseResponseSchema = z.object({
  data: CourseSchema,
});

export type Course = z.infer<typeof CourseSchema>;
export type GetCourseResponse = z.infer<typeof GetCourseResponseSchema>;
