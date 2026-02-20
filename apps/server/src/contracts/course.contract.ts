import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * Course Contracts
 * Defines contracts for course endpoints
 */

// Common schemas
export const CourseIdParamSchema = z.object({
   course_id: z.uuid('Invalid uuid')
});

// ============================================================================
// GET /courses/:course_id
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
      path: '/courses/:course_id',
      summary: 'Get course details',
      description: 'Retrieve all attributes for a specific course',
      tags: ['Courses']
   })
   .input(CourseIdParamSchema)
   .output(GetCourseResponseSchema);

// ============================================================================
// GET /courses/:course_id/prerequisites
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
   minimumGrade: z.string()
});

export const GetPrerequisitesResponseSchema = z.object({
   data: z.object({
      course: CourseInfoSchema,
      prerequisites: z.array(z.array(PrerequisiteSchema))
   })
});

export const getCoursePrerequisitesContract = oc
   .route({
      method: 'GET',
      path: '/courses/:course_id/prerequisites',
      summary: 'Get course prerequisites',
      description: 'Retrieve prerequisites for a specific course, grouped by OR-choice sets',
      tags: ['Courses']
   })
   .input(CourseIdParamSchema)
   .output(GetPrerequisitesResponseSchema);

// ============================================================================
// GET /courses/:course_id/corequisites
// ============================================================================

export const CorequisiteSchema = z.object({
   id: z.string(),
   name: z.string(),
   subjectId: z.string(),
   courseNumber: z.string()
});

export const GetCorequisitesResponseSchema = z.object({
   data: z.object({
      course: CourseInfoSchema,
      corequisites: z.array(CorequisiteSchema)
   })
});

export const getCourseCorequistesContract = oc
   .route({
      method: 'GET',
      path: '/courses/:course_id/corequisites',
      summary: 'Get course corequisites',
      description: 'Retrieve corequisites for a specific course',
      tags: ['Courses']
   })
   .input(CourseIdParamSchema)
   .output(GetCorequisitesResponseSchema);

// ============================================================================
// GET /courses/:course_id/availabilities
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
      path: '/courses/:course_id/availabilities',
      summary: 'Get course availabilities',
      description: 'Retrieve all sections available for a specific course across all terms',
      tags: ['Courses']
   })
   .input(CourseIdParamSchema)
   .output(GetCourseAvailabilitiesResponseSchema);

// ============================================================================
// Course contract router
// ============================================================================

export const courseContract = {
   course: getCourseContract,
   prerequisites: getCoursePrerequisitesContract,
   corequisites: getCourseCorequistesContract,
   availabilities: getCourseAvailabilitiesContract
};
