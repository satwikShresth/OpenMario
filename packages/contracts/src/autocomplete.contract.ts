import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * Autocomplete Contracts
 * Defines contracts for autocomplete/search endpoints
 */

// Common schemas
export const AutocompleteResultSchema = z.object({
   id: z.string(),
   name: z.string()
});

export const AutocompleteCompanyListResponseSchema = z.array(
   AutocompleteResultSchema
);
export const PositionListResponseSchema = z.array(AutocompleteResultSchema);
export const LocationListResponseSchema = z.array(AutocompleteResultSchema);

// Query schemas
export const CompanyQuerySchema = z.object({
   comp: z.string().min(3, 'Should have minimum 3 characters')
});

export const PositionQuerySchema = z.object({
   comp: z.string().min(1, 'Company Name is Required'),
   pos: z.string().min(3, 'Should have minimum 3 characters')
});

export const LocationQuerySchema = z.object({
   loc: z.string().min(3, 'Should have minimum 3 characters')
});

// Contracts
export const searchCompanyContract = oc
   .route({
      method: 'GET',
      path: '/autocomplete/company',
      summary: 'Search companies',
      description: 'Search for companies by name with fuzzy matching',
      tags: ['Search', 'Autocomplete']
   })
   .input(CompanyQuerySchema)
   .output(AutocompleteCompanyListResponseSchema);

export const searchPositionContract = oc
   .route({
      method: 'GET',
      path: '/autocomplete/position',
      summary: 'Search positions',
      description: 'Search for positions within a specific company',
      tags: ['Search', 'Autocomplete']
   })
   .input(PositionQuerySchema)
   .output(PositionListResponseSchema);

export const searchLocationContract = oc
   .route({
      method: 'GET',
      path: '/autocomplete/location',
      summary: 'Search locations',
      description:
         'Search for locations with fuzzy matching across city, state, and state code',
      tags: ['Search', 'Autocomplete']
   })
   .input(LocationQuerySchema)
   .output(LocationListResponseSchema);

// Autocomplete contract router
export const autocompleteContract = {
   company: searchCompanyContract,
   position: searchPositionContract,
   location: searchLocationContract
};
