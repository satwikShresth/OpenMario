import { oc } from '@orpc/contract'
import { z } from 'zod'

export const LocationInsertSchema = z.object({
   city: z.string().min(1).max(100),
   state: z.string().min(1).max(100),
   state_code: z.string().min(1).max(3),
})

export const LocationItemSchema = z.object({
   id: z.string(),
   city: z.string(),
   state: z.string(),
   state_code: z.string(),
   label: z.string(),
})

export const LocationCreateResponseSchema = z.object({
   location: LocationItemSchema,
   message: z.string(),
})

export const createLocationContract = oc
   .route({
      method: 'POST',
      path: '/location',
      summary: 'Create location',
      description: 'Create a new location (city / state)',
      tags: ['Locations'],
   })
   .input(LocationInsertSchema)
   .output(LocationCreateResponseSchema)

export const locationContract = {
   create: createLocationContract,
}
