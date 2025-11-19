/**
 * OpenMario API Contracts
 * Contract-first API definitions for all endpoints
 */

import { authContract } from './auth.contract';
import { autocompleteContract } from './autocomplete.contract';
import { companyContract } from './company.contract';
import { positionContract } from './position.contract';
import { graphContract } from './graph.contract';
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
   graph: graphContract,
   submission: submissionContract
};

// Re-export individual contracts for direct access
export * from './auth.contract';
export * from './autocomplete.contract';
export * from './company.contract';
export * from './position.contract';
export * from './graph.contract';
export * from './submission.contract';

// Type utilities for inferring input/output types
export type {
   InferContractRouterInputs,
   InferContractRouterOutputs
} from '@orpc/contract';
