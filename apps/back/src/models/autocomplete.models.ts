import { z } from 'zod';

// Define response schemas for autocomplete routes
export const CompanyResultSchema = z
   .object({
      id: z.string(),
      name: z.string(),
   })
   .meta({ id: 'CompanyResult' });

export const PositionResultSchema = z
   .object({
      id: z.string(),
      name: z.string(),
   })
   .meta({ id: 'PositionResult' });

export const LocationResultSchema = z
   .object({
      id: z.string(),
      name: z.string(),
   })
   .meta({ id: 'LocationResult' });

export const CompanyListResponseSchema = z
   .array(CompanyResultSchema)
   .meta({ id: 'CompanyListResponse' });
export const PositionListResponseSchema = z.array(PositionResultSchema).meta({
   id: 'PositionListResponse',
});
export const LocationListResponseSchema = z.array(LocationResultSchema).meta({
   id: 'LocationListResponse',
});
