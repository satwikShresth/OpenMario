import { z } from 'zod';

export const ReqParamsSchema = z.object({
   course_id: z.uuid('Invalid uuid'),
});
export type ReqParams = z.infer<typeof ReqParamsSchema>;

// Zod schema for the transformed response
export const ReqCourseSchema = z.object({
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

export const CorequisiteSchema = z.object({
   id: z.string(),
   name: z.string(),
   subjectId: z.string(),
   courseNumber: z.string(),
});

export const GetReqResponseSchema = z.object({
   data: z.object({
      course: ReqCourseSchema,
      prerequisites: z.array(z.array(PrerequisiteSchema)),
      corequisites: z.array(CorequisiteSchema),
   }),
});

export type GetReqResponse = z.infer<typeof GetReqResponseSchema>;

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
   instruction_type: z.string(),
   instruction_method: z.string(),
   crn: z.number(),
});

// API response wrapper
export const GetCourseResponseSchema = z.object({
   data: CourseSchema,
});

export type Course = z.infer<typeof CourseSchema>;
export type GetCourseResponse = z.infer<typeof GetCourseResponseSchema>;

const InstructorSchema = z.object({
   id: z.number(),
   avg_rating: z.number(),
   num_ratings: z.number(),
   name: z.string(),
   avg_difficulty: z.number(),
});

const CourseAvailabilitySchema = z.object({
   instructor: InstructorSchema,
   term: z.number(),
   crn: z.number(),
});

export const GetCourseAvailabilitiesResponseSchema = z.array(
   CourseAvailabilitySchema,
);

export type Instructor = z.infer<typeof InstructorSchema>;
export type CourseAvailability = z.infer<typeof CourseAvailabilitySchema>;
export type CourseAvailabilities = z.infer<
   typeof GetCourseAvailabilitiesResponseSchema
>;
