import { oc } from '@orpc/contract';
import { z } from 'zod';

/**
 * ESAP Contracts
 * Defines contracts for ESAP company and position review endpoints
 */

// ============================================================================
// Shared schemas
// ============================================================================

export const CompanyListQuerySchema = z.object({
   search: z.string().min(1).max(200).optional(),
   sort_by: z
      .enum(['omega_score', 'total_reviews', 'avg_rating_overall', 'company_name'])
      .optional()
      .default('total_reviews'),
   order: z.enum(['asc', 'desc']).optional().default('desc'),
   pageIndex: z.coerce.number().nonnegative().min(1).optional().default(1),
   pageSize: z.coerce.number().nonnegative().max(100).optional().default(20)
});

// ============================================================================
// GET /esap/companies
// ============================================================================

export const CompanyListItemSchema = z.object({
   company_id: z.string(),
   company_name: z.string(),
   total_reviews: z.coerce.number(),
   positions_reviewed: z.coerce.number(),
   omega_score: z.coerce.number().nullable(),
   satisfaction_score: z.coerce.number().nullable(),
   trust_score: z.coerce.number().nullable(),
   integrity_score: z.coerce.number().nullable(),
   growth_score: z.coerce.number().nullable(),
   work_life_score: z.coerce.number().nullable(),
   avg_rating_overall: z.coerce.number().nullable()
});

export const CompanyListResponseSchema = z.object({
   pageIndex: z.number(),
   pageSize: z.number(),
   count: z.number(),
   data: z.array(CompanyListItemSchema)
});

export const listCompaniesContract = oc
   .route({
      method: 'GET',
      path: '/esap/companies',
      summary: 'List ESAP companies',
      description: 'Retrieve companies with review aggregates and omega scores',
      tags: ['ESAP']
   })
   .input(CompanyListQuerySchema)
   .output(CompanyListResponseSchema);

// ============================================================================
// GET /esap/companies/:company_id
// ============================================================================

export const CompanyDetailSchema = z.object({
   company_id: z.string(),
   company_name: z.string(),
   total_reviews: z.coerce.number(),
   positions_reviewed: z.coerce.number(),
   omega_score: z.coerce.number().nullable(),
   satisfaction_score: z.coerce.number().nullable(),
   trust_score: z.coerce.number().nullable(),
   integrity_score: z.coerce.number().nullable(),
   growth_score: z.coerce.number().nullable(),
   work_life_score: z.coerce.number().nullable(),
   avg_rating_overall: z.coerce.number().nullable(),
   avg_rating_collaboration: z.coerce.number().nullable(),
   avg_rating_work_variety: z.coerce.number().nullable(),
   avg_rating_relationships: z.coerce.number().nullable(),
   avg_rating_supervisor_access: z.coerce.number().nullable(),
   avg_rating_training: z.coerce.number().nullable(),
   pct_would_recommend: z.coerce.number().nullable(),
   pct_description_accurate: z.coerce.number().nullable(),
   avg_days_per_week: z.coerce.number().nullable(),
   pct_public_transit: z.coerce.number().nullable(),
   pct_overtime_required: z.coerce.number().nullable()
});

export const PositionListItemSchema = z.object({
   position_id: z.string(),
   position_name: z.string(),
   company_id: z.string(),
   company_name: z.string(),
   total_reviews: z.coerce.number(),
   total_submissions: z.coerce.number(),
   avg_rating_overall: z.coerce.number().nullable(),
   avg_compensation: z.coerce.number().nullable(),
   omega_score: z.coerce.number().nullable(),
   satisfaction_score: z.coerce.number().nullable(),
   trust_score: z.coerce.number().nullable(),
   integrity_score: z.coerce.number().nullable(),
   growth_score: z.coerce.number().nullable(),
   work_life_score: z.coerce.number().nullable(),
   most_recent_posting_year: z.coerce.number().nullable()
});

export const CompanyDetailResponseSchema = z.object({
   company: CompanyDetailSchema,
   positions: z.array(PositionListItemSchema)
});

export const getCompanyContract = oc
   .route({
      method: 'GET',
      path: '/esap/companies/:company_id',
      summary: 'Get ESAP company detail',
      description:
         'Retrieve full company review aggregate and list of positions with scores',
      tags: ['ESAP']
   })
   .input(z.object({ company_id: z.string().uuid() }))
   .output(CompanyDetailResponseSchema);

// ============================================================================
// GET /esap/companies/:company_id/reviews
// ============================================================================

export const CompanyReviewsQuerySchema = z.object({
   company_id: z.string().uuid(),
   position_id: z.string().uuid().optional(),
   sort: z.enum(['year_desc', 'rating_desc', 'rating_asc']).optional().default('year_desc'),
   pageIndex: z.coerce.number().nonnegative().min(1).optional().default(1),
   pageSize: z.coerce.number().nonnegative().max(100).optional().default(20)
});

export const CompanyReviewItemSchema = z.object({
   id: z.string(),
   position_id: z.string(),
   position_name: z.string(),
   year: z.coerce.number(),
   coop_cycle: z.string(),
   department: z.string().nullable(),
   days_per_week: z.coerce.number().nullable(),
   overtime_required: z.boolean().nullable(),
   public_transit_available: z.boolean().nullable(),
   would_recommend: z.boolean().nullable(),
   description_accurate: z.boolean().nullable(),
   rating_overall: z.coerce.number().nullable(),
   rating_collaboration: z.coerce.number().nullable(),
   rating_work_variety: z.coerce.number().nullable(),
   rating_relationships: z.coerce.number().nullable(),
   rating_supervisor_access: z.coerce.number().nullable(),
   rating_training: z.coerce.number().nullable(),
   best_features: z.string().nullable(),
   challenges: z.string().nullable()
});

export const CompanyReviewsResponseSchema = z.object({
   pageIndex: z.number(),
   pageSize: z.number(),
   count: z.number(),
   data: z.array(CompanyReviewItemSchema)
});

export const getCompanyReviewsContract = oc
   .route({
      method: 'GET',
      path: '/esap/companies/:company_id/reviews',
      summary: 'Get company reviews',
      description: 'Retrieve individual position reviews for a company',
      tags: ['ESAP']
   })
   .input(CompanyReviewsQuerySchema)
   .output(CompanyReviewsResponseSchema);

// ============================================================================
// ESAP contract router
// ============================================================================

export const esapContract = {
   listCompanies: listCompaniesContract,
   getCompany: getCompanyContract,
   getCompanyReviews: getCompanyReviewsContract
};
