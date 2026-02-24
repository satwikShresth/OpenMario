import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * ESAP Contracts
 * Defines contracts for ESAP company and position review endpoints
 */

// ============================================================================
// GET /esap/companies/:company_id
// ============================================================================

export const CompanyDetailSchema = z.object({
   company_id: z.string(),
   company_name: z.string(),
   total_reviews: z.coerce.number().catch(0),
   positions_reviewed: z.coerce.number().catch(0),
   total_submissions: z.coerce.number().catch(0),
   omega_score: z.coerce.number().nullable().catch(null),
   satisfaction_score: z.coerce.number().nullable().catch(null),
   trust_score: z.coerce.number().nullable().catch(null),
   integrity_score: z.coerce.number().nullable().catch(null),
   growth_score: z.coerce.number().nullable().catch(null),
   work_life_score: z.coerce.number().nullable().catch(null),
   avg_rating_overall: z.coerce.number().nullable().catch(null),
   avg_compensation: z.coerce.number().nullable().catch(null),
   median_compensation: z.coerce.number().nullable().catch(null),
   avg_rating_collaboration: z.coerce.number().nullable().catch(null),
   avg_rating_work_variety: z.coerce.number().nullable().catch(null),
   avg_rating_relationships: z.coerce.number().nullable().catch(null),
   avg_rating_supervisor_access: z.coerce.number().nullable().catch(null),
   avg_rating_training: z.coerce.number().nullable().catch(null),
   pct_would_recommend: z.coerce.number().nullable().catch(null),
   pct_description_accurate: z.coerce.number().nullable().catch(null),
   avg_days_per_week: z.coerce.number().nullable().catch(null),
   pct_public_transit: z.coerce.number().nullable().catch(null),
   pct_overtime_required: z.coerce.number().nullable().catch(null)
});

export const PositionListItemSchema = z.object({
   position_id: z.string(),
   position_name: z.string(),
   company_id: z.string(),
   company_name: z.string(),
   total_reviews: z.coerce.number().catch(0),
   total_submissions: z.coerce.number().catch(0),
   avg_rating_overall: z.coerce.number().nullable().catch(null),
   avg_rating_collaboration: z.coerce.number().nullable().catch(null),
   avg_rating_work_variety: z.coerce.number().nullable().catch(null),
   avg_rating_relationships: z.coerce.number().nullable().catch(null),
   avg_rating_supervisor_access: z.coerce.number().nullable().catch(null),
   avg_rating_training: z.coerce.number().nullable().catch(null),
   avg_compensation: z.coerce.number().nullable().catch(null),
   median_compensation: z.coerce.number().nullable().catch(null),
   omega_score: z.coerce.number().nullable().catch(null),
   satisfaction_score: z.coerce.number().nullable().catch(null),
   trust_score: z.coerce.number().nullable().catch(null),
   integrity_score: z.coerce.number().nullable().catch(null),
   growth_score: z.coerce.number().nullable().catch(null),
   work_life_score: z.coerce.number().nullable().catch(null),
   most_recent_posting_year: z.coerce.number().nullable().catch(null)
});

export const CompanyDetailResponseSchema = z.object({
   company: CompanyDetailSchema,
   positions: z.array(PositionListItemSchema)
});

export const getCompanyContract = oc
   .route({
      method: 'GET',
      path: '/esap/company/{company_id}',
      summary: 'Get ESAP company detail',
      description:
         'Retrieve full company review aggregate and list of positions with scores',
      tags: ['ESAP'],
      inputStructure: 'detailed'
   })
   .input(
      z.object({
         params: z.object({ company_id: z.uuid() })
      })
   )
   .output(CompanyDetailResponseSchema);

// ============================================================================
// Shared review query / item schemas
// ============================================================================

export const ReviewsQuerySchema = z.object({
   sort: z
      .enum(['year_desc', 'rating_desc', 'rating_asc'])
      .optional()
      .default('year_desc'),
   pageIndex: z.coerce.number().nonnegative().min(1).optional().default(1),
   pageSize: z.coerce.number().nonnegative().max(100).optional().default(20)
});

export const ReviewItemSchema = z.object({
   id: z.string(),
   position_id: z.string(),
   position_name: z.string(),
   year: z.coerce.number().catch(0),
   coop_cycle: z.string().catch(''),
   department: z.string().nullable().catch(null),
   days_per_week: z.coerce.number().nullable().catch(null),
   overtime_required: z.boolean().nullable().catch(null),
   public_transit_available: z.boolean().nullable().catch(null),
   would_recommend: z.boolean().nullable().catch(null),
   description_accurate: z.boolean().nullable().catch(null),
   rating_overall: z.coerce.number().nullable().catch(null),
   rating_collaboration: z.coerce.number().nullable().catch(null),
   rating_work_variety: z.coerce.number().nullable().catch(null),
   rating_relationships: z.coerce.number().nullable().catch(null),
   rating_supervisor_access: z.coerce.number().nullable().catch(null),
   rating_training: z.coerce.number().nullable().catch(null),
   best_features: z.string().nullable().catch(null),
   challenges: z.string().nullable().catch(null)
});

export const ReviewsResponseSchema = z.object({
   pageIndex: z.number(),
   pageSize: z.number(),
   count: z.number(),
   data: z.array(ReviewItemSchema)
});

export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export type ReviewsResponse = z.infer<typeof ReviewsResponseSchema>;

// Aliases kept for backward compatibility
export const CompanyReviewsQuerySchema = ReviewsQuerySchema;
export const CompanyReviewItemSchema = ReviewItemSchema;
export const CompanyReviewsResponseSchema = ReviewsResponseSchema;

// ============================================================================
// GET /esap/company/{company_id}/reviews
// ============================================================================

export const getCompanyReviewsContract = oc
   .route({
      method: 'GET',
      path: '/esap/company/{company_id}/reviews',
      summary: 'Get company reviews',
      description: 'Retrieve all position reviews for a company',
      inputStructure: 'detailed',
      tags: ['ESAP']
   })
   .input(
      z.object({
         params: z.object({ company_id: z.uuid() }),
         query: ReviewsQuerySchema
      })
   )
   .output(ReviewsResponseSchema);

// ============================================================================
// GET /esap/company/{company_id}/position/{position_id}/reviews
// ============================================================================

export const getPositionReviewsContract = oc
   .route({
      method: 'GET',
      path: '/esap/company/{company_id}/position/{position_id}/reviews',
      summary: 'Get position reviews',
      description: 'Retrieve reviews for a specific position within a company',
      inputStructure: 'detailed',
      tags: ['ESAP']
   })
   .input(
      z.object({
         params: z.object({
            company_id: z.uuid(),
            position_id: z.uuid()
         }),
         query: ReviewsQuerySchema
      })
   )
   .output(ReviewsResponseSchema);

// ============================================================================
// ESAP contract router
// ============================================================================

export const esapContract = {
   getCompany: getCompanyContract,
   getCompanyReviews: getCompanyReviewsContract,
   getPositionReviews: getPositionReviewsContract
};
