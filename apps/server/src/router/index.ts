/**
 * OpenMario API Router Implementation
 * Implements the API contracts with actual business logic
 */

import { implement } from '@orpc/server';
import { contract } from '@/contracts';

// Import individual route handlers
import {
   searchCompany,
   searchPosition,
   searchLocation
} from './autocomplete.router';
import { createCompany } from './company.router';
import { createPosition } from './position.router';
import { getSearchToken } from './auth.router';
import {
   getCourse,
   getCoursePrerequisites,
   getCourseCorequistes,
   getCourseAvailabilities
} from './course.router';
import {
   listSubmissions,
   createSubmission,
   updateSubmission
} from './submission.router';

const os = implement(contract);

/**
 * Main API router that combines all route implementations
 * This enforces the contract at runtime and provides full type safety
 */
const router = os.router({
   auth: {
      getSearchToken: getSearchToken
   },
   autocomplete: {
      company: searchCompany,
      position: searchPosition,
      location: searchLocation
   },
   company: {
      create: createCompany
   },
   position: {
      create: createPosition
   },
   course: {
      course: getCourse,
      prerequisites: getCoursePrerequisites,
      corequisites: getCourseCorequistes,
      availabilities: getCourseAvailabilities
   },
   submission: {
      list: listSubmissions,
      create: createSubmission,
      update: updateSubmission
   }
});

// Export the router type for client generation
export type Router = typeof router;

// Export router for use in main server
export { router };

// Default export for OpenAPIHandler
export default router;
