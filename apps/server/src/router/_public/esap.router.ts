import { os } from '@/router/helpers';
import type { DbClient } from '@openmario/db';
import {
   companyDetailMView,
   companyPositionsMView,
   position,
   position_review
} from '@openmario/db';
import { count, eq, inArray, sql } from 'drizzle-orm';

// ============================================================================
// GET /esap/company/{company_id}
// ============================================================================

export const getCompany = os.companies.getCompany.handler(
   async ({
      input: {
         params: { company_id }
      },
      context: { db }
   }) => {
      const [company] = await db
         .select()
         .from(companyDetailMView)
         .where(eq(companyDetailMView.company_id, company_id))
         .limit(1);

      if (!company) throw new Error('Company not found');

      const positions = await db
         .select()
         .from(companyPositionsMView)
         .where(eq(companyPositionsMView.company_id, company_id))
         .orderBy(sql`${companyPositionsMView.omega_score} DESC NULLS LAST`);

      return { company, positions };
   }
);

// ============================================================================
// Shared review helpers
// ============================================================================

const buildReviewsCTE = (db: DbClient) =>
   db.$with('reviews').as(
      db
         .select({
            id: position_review.id,
            position_id: position_review.position_id,
            position_name: position.name,
            year: position_review.year,
            coop_cycle: position_review.coop_cycle,
            department: position_review.department,
            days_per_week: position_review.days_per_week,
            overtime_required: position_review.overtime_required,
            public_transit_available: position_review.public_transit_available,
            would_recommend: position_review.would_recommend,
            description_accurate: position_review.description_accurate,
            rating_overall: position_review.rating_overall,
            rating_collaboration: position_review.rating_collaboration,
            rating_work_variety: position_review.rating_work_variety,
            rating_relationships: position_review.rating_relationships,
            rating_supervisor_access: position_review.rating_supervisor_access,
            rating_training: position_review.rating_training,
            best_features: position_review.best_features,
            challenges: position_review.challenges
         })
         .from(position_review)
         .innerJoin(position, eq(position_review.position_id, position.id))
   );

type ReviewsCTE = ReturnType<typeof buildReviewsCTE>;

const reviewSortExpr = (
   reviews: ReviewsCTE,
   sort: 'year_desc' | 'rating_desc' | 'rating_asc'
) =>
   sort === 'rating_desc'
      ? sql`${reviews.rating_overall} DESC NULLS LAST, ${reviews.year} DESC`
      : sort === 'rating_asc'
        ? sql`${reviews.rating_overall} ASC NULLS LAST, ${reviews.year} DESC`
        : sql`${reviews.year} DESC, ${reviews.coop_cycle} ASC`;

// ============================================================================
// GET /esap/company/{company_id}/reviews
// ============================================================================

export const getCompanyReviews = os.companies.getCompanyReviews.handler(
   async ({
      input: {
         params: { company_id },
         query: { sort, pageIndex, pageSize }
      },
      context: { db }
   }) => {
      const reviews = buildReviewsCTE(db);

      const positionIds = db
         .select({ id: position.id })
         .from(position)
         .where(eq(position.company_id, company_id));

      const [countRow] = await db
         .with(reviews)
         .select({ total: count() })
         .from(reviews)
         .where(inArray(reviews.position_id, positionIds));

      const total = countRow?.total ?? 0;

      const data = await db
         .with(reviews)
         .select()
         .from(reviews)
         .where(inArray(reviews.position_id, positionIds))
         .orderBy(reviewSortExpr(reviews, sort))
         .offset((pageIndex - 1) * pageSize)
         .limit(pageSize);

      return { pageIndex, pageSize, count: total, data };
   }
);

// ============================================================================
// GET /esap/company/{company_id}/position/{position_id}/reviews
// ============================================================================

export const getPositionReviews = os.companies.getPositionReviews.handler(
   async ({
      input: {
         params: { position_id },
         query: { sort, pageIndex, pageSize }
      },
      context: { db }
   }) => {
      const reviews = buildReviewsCTE(db);

      const [countRow] = await db
         .with(reviews)
         .select({ total: count() })
         .from(reviews)
         .where(eq(reviews.position_id, position_id));

      const total = countRow?.total ?? 0;

      const data = await db
         .with(reviews)
         .select()
         .from(reviews)
         .where(eq(reviews.position_id, position_id))
         .orderBy(reviewSortExpr(reviews, sort))
         .offset((pageIndex - 1) * pageSize)
         .limit(pageSize);

      return { pageIndex, pageSize, count: total, data };
   }
);
