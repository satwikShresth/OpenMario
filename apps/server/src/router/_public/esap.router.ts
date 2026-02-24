import { os } from '@/router/helpers';
import {
   db,
   companyOmegaMView,
   companyDetailMView,
   companyPositionsMView,
   position,
   position_review
} from '@/db';
import { eq, asc, inArray, sql, type SQL } from 'drizzle-orm';
import { maybe } from '@/utils';

// ============================================================================
// GET /esap/companies
// ============================================================================

export const listCompanies = os.companies.listCompanies.handler(
   async ({ input }) => {
      const { search, sort_by, order, pageIndex, pageSize } = input;

      const whereClause = maybe(search, (s: string) => {
         const terms = s.trim().split(/\s+/);

         const termClauses = terms.map(
            term => sql`paradedb.boolean(
               should => ARRAY[
                  paradedb.fuzzy_term('name', ${term}, distance => 2),
                  paradedb.boost(2.0, paradedb.fuzzy_term('name', ${term}, distance => 2, prefix => true))
               ]
            )`
         );

         return sql`${companyOmegaMView.company_id} @@@ paradedb.boolean(
            must => ARRAY[${sql.join(termClauses, sql`, `)}]
         )`;
      });

      const sortColumnMap: Record<string, SQL> = {
         omega_score: sql`omega_score`,
         total_reviews: sql`total_reviews`,
         avg_rating_overall: sql`omega_score`,
         company_name: sql`company_name`
      };

      const sortCol = sortColumnMap[sort_by] ?? sql`omega_score`;
      const orderExpr =
         order === 'asc' ? asc(sortCol) : sql`${sortCol} DESC NULLS LAST`;

      const count = await db.$count(companyOmegaMView, whereClause);

      const data = await db
         .select()
         .from(companyOmegaMView)
         .where(whereClause)
         .orderBy(orderExpr)
         .offset((pageIndex - 1) * pageSize)
         .limit(pageSize);

      return { pageIndex, pageSize, count, data };
   }
);

// ============================================================================
// GET /esap/company/{company_id}
// ============================================================================

export const getCompany = os.companies.getCompany.handler(
   async ({
      input: {
         params: { company_id }
      }
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

const reviewFields = {
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
};

const reviewSortExpr = (sort: 'year_desc' | 'rating_desc' | 'rating_asc') =>
   sort === 'rating_desc'
      ? sql`${position_review.rating_overall} DESC NULLS LAST, ${position_review.year} DESC`
      : sort === 'rating_asc'
        ? sql`${position_review.rating_overall} ASC NULLS LAST, ${position_review.year} DESC`
        : sql`${position_review.year} DESC, ${position_review.coop_cycle} ASC`;

// ============================================================================
// GET /esap/company/{company_id}/reviews
// ============================================================================

export const getCompanyReviews = os.companies.getCompanyReviews.handler(
   async ({
      input: {
         params: { company_id },
         query: { sort, pageIndex, pageSize }
      }
   }) => {
      const positionIds = db
         .select({ id: position.id })
         .from(position)
         .where(eq(position.company_id, company_id));

      const count = await db.$count(
         position_review,
         inArray(position_review.position_id, positionIds)
      );

      const data = await db
         .select(reviewFields)
         .from(position_review)
         .innerJoin(position, eq(position_review.position_id, position.id))
         .where(inArray(position_review.position_id, positionIds))
         .orderBy(reviewSortExpr(sort))
         .offset((pageIndex - 1) * pageSize)
         .limit(pageSize);

      return { pageIndex, pageSize, count, data };
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
      }
   }) => {
      const count = await db.$count(
         position_review,
         eq(position_review.position_id, position_id)
      );

      const data = await db
         .select(reviewFields)
         .from(position_review)
         .innerJoin(position, eq(position_review.position_id, position.id))
         .where(eq(position_review.position_id, position_id))
         .orderBy(reviewSortExpr(sort))
         .offset((pageIndex - 1) * pageSize)
         .limit(pageSize);

      return { pageIndex, pageSize, count, data };
   }
);
