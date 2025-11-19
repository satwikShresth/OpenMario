import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * Graph Contracts
 * Defines contracts for course graph/relationship endpoints
 */

// Common schemas
export const CourseIdParamSchema = z.object({
   course_id: z.uuid('Invalid uuid')
});

// ============================================================================
// GET /graph/courses/:course_id - Get course details
// ============================================================================

export const CourseSchema = z.object({
   id: z.string(),
   subject_id: z.string(),
   course_number: z.string(),
   title: z.string(),
   description: z.string().nullable(),
   credits: z.number(),
   writing_intensive: z.boolean(),
   repeat_status: z.string().nullable(),
   instruction_type: z.string().nullable(),
   instruction_method: z.string().nullable(),
   crn: z.number().nullable()
});

export const GetCourseResponseSchema = z.object({
   data: CourseSchema
});

export const getCourseContract = oc
   .route({
      method: 'GET',
      path: '/graph/courses/:course_id',
      summary: 'Get course details',
      description: 'Retrieve all attributes for a specific course',
      tags: ['Graph', 'Courses']
   })
   .input(CourseIdParamSchema)
   .output(GetCourseResponseSchema);

// ============================================================================
// GET /graph/req/:course_id - Get course prerequisites and corequisites
// ============================================================================

export const CourseInfoSchema = z.object({
   id: z.string(),
   name: z.string(),
   subjectId: z.string(),
   courseNumber: z.string()
});

export const PrerequisiteSchema = z.object({
   id: z.string(),
   name: z.string(),
   subjectId: z.string(),
   courseNumber: z.string(),
   relationshipType: z.string(),
   groupId: z.string(),
   canTakeConcurrent: z.boolean(),
   minimumGrade: z.string(),
   relationshipId: z.number().nullable() // Neo4j id() function returns integers, can be null
});

export const CorequisiteSchema = z.object({
   id: z.string(),
   name: z.string(),
   subjectId: z.string(),
   courseNumber: z.string()
});

export const GetReqResponseSchema = z.object({
   data: z.object({
      course: CourseInfoSchema,
      prerequisites: z.array(z.array(PrerequisiteSchema)),
      corequisites: z.array(CorequisiteSchema)
   })
});

export const getCourseRequisitesContract = oc
   .route({
      method: 'GET',
      path: '/graph/req/:course_id',
      summary: 'Get course requisites',
      description:
         'Retrieve prerequisites and corequisites for a specific course',
      tags: ['Graph', 'Courses']
   })
   .input(CourseIdParamSchema)
   .output(GetReqResponseSchema);

// ============================================================================
// GET /graph/courses/availabilities/:course_id - Get course availabilities
// ============================================================================

export const InstructorSchema = z.object({
   id: z.number(),
   name: z.string(),
   avg_difficulty: z.number().nullable(),
   avg_rating: z.number().nullable(),
   num_ratings: z.number().nullable()
});

export const CourseAvailabilitySchema = z.object({
   term: z.string(),
   crn: z.string(),
   instructor: InstructorSchema.nullable()
});

export const GetCourseAvailabilitiesResponseSchema = z.array(
   CourseAvailabilitySchema
);

export const getCourseAvailabilitiesContract = oc
   .route({
      method: 'GET',
      path: '/graph/courses/availabilities/:course_id',
      summary: 'Get course availabilities',
      description:
         'Retrieve all sections available for a specific course across all terms',
      tags: ['Graph', 'Courses']
   })
   .input(CourseIdParamSchema)
   .output(GetCourseAvailabilitiesResponseSchema);

// ============================================================================
// Graph contract router
// ============================================================================

export const graphContract = {
   course: getCourseContract,
   requisites: getCourseRequisitesContract,
   availabilities: getCourseAvailabilitiesContract
};
