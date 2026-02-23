/**
 * OpenMario API Router Implementation
 * Implements the API contracts with actual business logic
 */

import { os } from '@/router/helpers';

// Import individual route handlers
import * as autocomplete from './autocomplete.router';
import * as company from './company.router';
import * as position from './position.router';
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
   autocomplete: {
      company: autocomplete.searchCompany,
      position: autocomplete.searchPosition,
      location: autocomplete.searchLocation
   },
   company: {
      create: company.createCompany
   },
   position: {
      create: position.createPosition
   },
   course: {
      course: course.getCourse,
      prerequisites: course.getCoursePrerequisites,
      corequisites: course.getCourseCorequistes,
      availabilities: course.getCourseAvailabilities
   },
   submission: {
      list: submission.listSubmissions,
      create: submission.createSubmission,
      update: submission.updateSubmission
   },
   esap: {
      listCompanies: esap.listCompanies,
      getCompany: esap.getCompany,
      getCompanyReviews: esap.getCompanyReviews
   },
   professor: {
      list: professor.listProfessors,
      get: professor.getProfessor,
      sections: professor.getProfessorSections
   }
});

// Export the router type for client generation
export type Router = typeof router;

export { router };
