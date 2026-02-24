import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * Company Contracts
 * Defines contracts for company-related endpoints
 */

// Schemas
export const CompanyInsertSchema = z.object({
   name: z.string().min(1, 'Company name is required')
});

export const CompanyItemSchema = z.object({
   id: z.string(),
   name: z.string()
});

export const CompanyCreateResponseSchema = z.object({
   company: CompanyItemSchema,
   message: z.string()
});

// Contracts
export const createCompanyContract = oc
   .route({
      method: 'POST',
      path: '/company',
      summary: 'Create company',
      description: 'Create a new company',
      tags: ['Companies']
   })
   .input(CompanyInsertSchema)
   .output(CompanyCreateResponseSchema);

// Company contract router
export const companyContract = {
   create: createCompanyContract
};
