/**
 * OpenMario API Router Implementation
 * Implements the API contracts with actual business logic
 */

import { os } from '@/router/helpers';

import * as company from './company.router';
import * as position from './position.router';
import * as location from './location.router';
import * as auth from './auth.router';
import * as course from './course.router';
import * as submission from './submission.router';
import * as esap from './esap.router';
import * as professor from './professor.router';

/**
 * Main API router that combines all route implementations
 * This enforces the contract at runtime and provides full type safety
 */
const router = os.router({
   auth,
   company: {
      create: company.createCompany
   },
   position: {
      create: position.createPosition
   },
   location: {
      create: location.createLocation
   },
   course: {
      course: course.getCourse,
      prerequisites: course.getCoursePrerequisites,
      corequisites: course.getCourseCorequistes,
      dependents: course.getCourseDependents,
      availabilities: course.getCourseAvailabilities
   },
   submission: {
      list: submission.listSubmissions,
      create: submission.createSubmission,
      update: submission.updateSubmission
   },
   companies: {
      getCompany: esap.getCompany,
      getCompanyReviews: esap.getCompanyReviews,
      getPositionReviews: esap.getPositionReviews
   },
   professor: {
      get: professor.getProfessor,
      sections: professor.getProfessorSections
   }
});

export type Router = typeof router;

export { router };
