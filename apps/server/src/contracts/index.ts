/**
 * OpenMario API Contracts
 * Contract-first API definitions for all endpoints
 */

import { authContract } from './auth.contract';
import { autocompleteContract } from './autocomplete.contract';
import { companyContract } from './company.contract';
import { positionContract } from './position.contract';
import { courseContract } from './course.contract';
import { submissionContract } from './submission.contract';

/**
 * Main contract router
 * Organizes all API contracts in a hierarchical structure
 */
export const contract = {
   auth: authContract,
   autocomplete: autocompleteContract,
   company: companyContract,
   position: positionContract,
   course: courseContract,
   submission: submissionContract
};

// ============================================================================
// Re-export all schemas and contracts for client usage
// ============================================================================

// Auth contracts & schemas
export * from './auth.contract';

// Autocomplete contracts & schemas
export * from './autocomplete.contract';

// Company contracts & schemas
export * from './company.contract';

// Position contracts & schemas
export * from './position.contract';

// Course contracts & schemas
export * from './course.contract';

// Submission contracts & schemas
export * from './submission.contract';

// ============================================================================
// Type utilities for inferring input/output types from contracts
// ============================================================================

export type {
   InferContractRouterInputs,
   InferContractRouterOutputs
} from '@orpc/contract';

// ============================================================================
// Inferred TypeScript types from Zod schemas (for client usage)
// ============================================================================

import type { z } from 'zod';

// Auth types

// Autocomplete types
import type {
   AutocompleteResultSchema,
   CompanyQuerySchema,
   PositionQuerySchema,
   LocationQuerySchema
} from './autocomplete.contract';

// Company types
import type {
   CompanyInsertSchema,
   CompanyItemSchema,
   CompanyCreateResponseSchema
} from './company.contract';

// Position types
import type {
   PositionInsertSchema,
   PositionItemSchema,
   PositionCreateResponseSchema
} from './position.contract';

// Course types
import type {
   CourseIdParamSchema,
   CourseSchema,
   GetCourseResponseSchema,
   CourseInfoSchema,
   PrerequisiteSchema,
   GetPrerequisitesResponseSchema,
   CorequisiteSchema,
   GetCorequisitesResponseSchema,
   InstructorSchema,
   CourseAvailabilitySchema,
   GetCourseAvailabilitiesResponseSchema
} from './course.contract';

// Submission types
import type {
   SubmissionQuerySchema,
   SubmissionAggregateSchema,
   SubmissionAggregateUpdateSchema,
   SubmissionListItemSchema,
   SubmissionListResponseSchema,
   SubmissionItemSchema,
   SubmissionCreateResponseSchema,
   SubmissionUpdateResponseSchema
} from './submission.contract';

// Export inferred types
export type AutocompleteResult = z.infer<typeof AutocompleteResultSchema>;
export type CompanyQuery = z.infer<typeof CompanyQuerySchema>;
export type PositionQuery = z.infer<typeof PositionQuerySchema>;
export type LocationQuery = z.infer<typeof LocationQuerySchema>;

export type CompanyInsert = z.infer<typeof CompanyInsertSchema>;
export type CompanyItem = z.infer<typeof CompanyItemSchema>;
export type CompanyCreateResponse = z.infer<typeof CompanyCreateResponseSchema>;

export type PositionInsert = z.infer<typeof PositionInsertSchema>;
export type PositionItem = z.infer<typeof PositionItemSchema>;
export type PositionCreateResponse = z.infer<
   typeof PositionCreateResponseSchema
>;

export type CourseIdParam = z.infer<typeof CourseIdParamSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type GetCourseResponse = z.infer<typeof GetCourseResponseSchema>;
export type CourseInfo = z.infer<typeof CourseInfoSchema>;
export type Prerequisite = z.infer<typeof PrerequisiteSchema>;
export type GetPrerequisitesResponse = z.infer<typeof GetPrerequisitesResponseSchema>;
export type Corequisite = z.infer<typeof CorequisiteSchema>;
export type GetCorequisitesResponse = z.infer<typeof GetCorequisitesResponseSchema>;
export type Instructor = z.infer<typeof InstructorSchema>;
export type CourseAvailability = z.infer<typeof CourseAvailabilitySchema>;
export type GetCourseAvailabilitiesResponse = z.infer<
   typeof GetCourseAvailabilitiesResponseSchema
>;

export type SubmissionQuery = z.infer<typeof SubmissionQuerySchema>;
export type SubmissionAggregate = z.infer<typeof SubmissionAggregateSchema>;
export type SubmissionAggregateUpdate = z.infer<
   typeof SubmissionAggregateUpdateSchema
>;
export type SubmissionListItem = z.infer<typeof SubmissionListItemSchema>;
export type SubmissionListResponse = z.infer<
   typeof SubmissionListResponseSchema
>;
export type SubmissionItem = z.infer<typeof SubmissionItemSchema>;
export type SubmissionCreateResponse = z.infer<
   typeof SubmissionCreateResponseSchema
>;
export type SubmissionUpdateResponse = z.infer<
   typeof SubmissionUpdateResponseSchema
>;
