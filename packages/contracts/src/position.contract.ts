import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * Position Contracts
 * Defines contracts for position-related endpoints
 */

export const PositionInsertSchema = z.object({
   name: z.string().min(1, 'Position name is required'),
   company_id: z.uuid('Company id is required')
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

export const createPositionContract = oc
   .route({
      method: 'POST',
      path: '/position',
      summary: 'Create position',
      description: 'Create a new position for an existing company by company_id',
      tags: ['Positions']
   })
   .input(PositionInsertSchema)
   .output(PositionCreateResponseSchema);

export const positionContract = {
   create: createPositionContract
};
