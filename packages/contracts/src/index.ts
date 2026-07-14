/**
 * OpenMario API Contracts
 * Contract-first API definitions for all endpoints
 */

import { authContract } from './auth.contract';
import { companyContract } from './company.contract';
import { positionContract } from './position.contract';
import { locationContract } from './location.contract';
import { courseContract } from './course.contract';
import { submissionContract } from './submission.contract';
import { esapContract } from './esap.contract';
import { professorContract } from './professor.contract';

/**
 * Main contract router
 * Organizes all API contracts in a hierarchical structure
 */
export const contracts = {
   auth: authContract,
   company: companyContract,
   position: positionContract,
   location: locationContract,
   course: courseContract,
   submission: submissionContract,
   companies: esapContract,
   professor: professorContract
};

// ============================================================================
// Re-export all schemas and contracts for client usage
// ============================================================================

export * from './auth.contract';
export * from './company.contract';
export * from './position.contract';
export * from './location.contract';
export * from './course.contract';
export * from './submission.contract';
export * from './esap.contract';
export * from './professor.contract';

export type {
   InferContractRouterInputs,
   InferContractRouterOutputs
} from '@orpc/contract';

import type { z } from 'zod';

import type {
   CompanyInsertSchema,
   CompanyItemSchema,
   CompanyCreateResponseSchema
} from './company.contract';

import type {
   PositionInsertSchema,
   PositionItemSchema,
   PositionCreateResponseSchema
} from './position.contract';

import type {
   LocationInsertSchema,
   LocationItemSchema,
   LocationCreateResponseSchema
} from './location.contract';

import type {
   CourseIdParamSchema,
   CourseSchema,
   GetCourseResponseSchema,
   CourseInfoSchema,
   PrerequisiteSchema,
   GetPrerequisitesResponseSchema,
   CorequisiteSchema,
   GetCorequisitesResponseSchema,
   DependentSchema,
   GetDependentsResponseSchema,
   InstructorSchema,
   CourseAvailabilitySchema,
   GetCourseAvailabilitiesResponseSchema
} from './course.contract';

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

export type CompanyInsert = z.infer<typeof CompanyInsertSchema>;
export type CompanyItem = z.infer<typeof CompanyItemSchema>;
export type CompanyCreateResponse = z.infer<typeof CompanyCreateResponseSchema>;

export type PositionInsert = z.infer<typeof PositionInsertSchema>;
export type PositionItem = z.infer<typeof PositionItemSchema>;
export type PositionCreateResponse = z.infer<
   typeof PositionCreateResponseSchema
>;

export type LocationInsert = z.infer<typeof LocationInsertSchema>;
export type LocationItem = z.infer<typeof LocationItemSchema>;
export type LocationCreateResponse = z.infer<
   typeof LocationCreateResponseSchema
>;

export type CourseIdParam = z.infer<typeof CourseIdParamSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type GetCourseResponse = z.infer<typeof GetCourseResponseSchema>;
export type CourseInfo = z.infer<typeof CourseInfoSchema>;
export type Prerequisite = z.infer<typeof PrerequisiteSchema>;
export type GetPrerequisitesResponse = z.infer<
   typeof GetPrerequisitesResponseSchema
>;
export type Corequisite = z.infer<typeof CorequisiteSchema>;
export type GetCorequisitesResponse = z.infer<
   typeof GetCorequisitesResponseSchema
>;
export type Dependent = z.infer<typeof DependentSchema>;
export type GetDependentsResponse = z.infer<typeof GetDependentsResponseSchema>;
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
