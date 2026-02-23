import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * Position Contracts
 * Defines contracts for position-related endpoints
 */

// Schemas
export const PositionInsertSchema = z.object({
   name: z.string().min(1, 'Position name is required'),
   company: z.string().min(1, 'Company is required')
});

export const PositionItemSchema = z.object({
   id: z.string(),
   name: z.string(),
   company_id: z.string()
});

export const PositionCreateResponseSchema = z.object({
   position: PositionItemSchema,
   message: z.string()
});

// Contracts
export const createPositionContract = oc
   .route({
      method: 'POST',
      path: '/position',
      summary: 'Create position',
      description:
         'Create a new position for an existing company using company name',
      tags: ['Positions']
   })
   .input(PositionInsertSchema)
   .output(PositionCreateResponseSchema);

// Position contract router
export const positionContract = {
   create: createPositionContract
};
