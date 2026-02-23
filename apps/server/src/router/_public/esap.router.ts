import { os } from '@/router/helpers';
import {
   db,
   companyOmegaMView,
   companyReviewAggregateMView,
   positionOmegaMView,
   positionInformationMView,
   company,
   position,
   position_review
} from '@/db';
import { and, eq, asc, sql, count, type SQL } from 'drizzle-orm';
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

      const fields = {
         company_id: companyOmegaMView.company_id,
         company_name: companyOmegaMView.company_name,
         total_reviews: companyOmegaMView.total_reviews,
         positions_reviewed: companyOmegaMView.positions_reviewed,
         omega_score: companyOmegaMView.omega_score,
         satisfaction_score: companyOmegaMView.satisfaction_score,
         trust_score: companyOmegaMView.trust_score,
         integrity_score: companyOmegaMView.integrity_score,
         growth_score: companyOmegaMView.growth_score,
         work_life_score: companyOmegaMView.work_life_score,
         avg_rating_overall: sql<string | null>`null::numeric`.as('avg_rating_overall')
      };

      return await Promise.all([
         db
            .select({ count: sql<number>`count(*)`.as('count') })
            .from(companyOmegaMView)
            .where(whereClause)
            .then(r => Number(r[0]?.count ?? 0)),
         db
            .select(fields)
            .from(companyOmegaMView)
            .where(whereClause)
            .orderBy(orderExpr)
            .offset((pageIndex - 1) * pageSize)
            .limit(pageSize)
      ])
         .then(([count, data]) => ({
            pageIndex,
            pageSize,
            count,
            data: data as any
         }))
         .catch(error => {
            console.error('Error listing companies:', error);
            throw new Error(error.message || 'Failed to list companies');
         });
   }
);

// ============================================================================
// GET /esap/companies/:company_id
// ============================================================================

export const getCompany = os.companies.getCompany.handler(
   async ({ input: { company_id } }) => {
      const omegaFields = {
         company_id: companyOmegaMView.company_id,
         company_name: companyOmegaMView.company_name,
         total_reviews: companyOmegaMView.total_reviews,
         positions_reviewed: companyOmegaMView.positions_reviewed,
         omega_score: companyOmegaMView.omega_score,
         satisfaction_score: companyOmegaMView.satisfaction_score,
         trust_score: companyOmegaMView.trust_score,
         integrity_score: companyOmegaMView.integrity_score,
         growth_score: companyOmegaMView.growth_score,
         work_life_score: companyOmegaMView.work_life_score
      };

      // Run both view queries separately to avoid ambiguous column names in a join.
      const [omegaRow, aggregateRow] = await Promise.all([
         db
            .select(omegaFields)
            .from(companyOmegaMView)
            .where(eq(companyOmegaMView.company_id, company_id))
            .limit(1)
            .then(r => r[0]),
         db
            .select()
            .from(companyReviewAggregateMView)
            .where(eq(companyReviewAggregateMView.company_id, company_id))
            .limit(1)
            .then(r => r[0])
      ]);

      if (!omegaRow) throw new Error('Company not found');

      const companyRow = {
         company_id: omegaRow.company_id,
         company_name: omegaRow.company_name,
         total_reviews: omegaRow.total_reviews,
         positions_reviewed: omegaRow.positions_reviewed,
         omega_score: omegaRow.omega_score,
         satisfaction_score: omegaRow.satisfaction_score,
         trust_score: omegaRow.trust_score,
         integrity_score: omegaRow.integrity_score,
         growth_score: omegaRow.growth_score,
         work_life_score: omegaRow.work_life_score,
         avg_rating_overall: aggregateRow?.avg_rating_overall ?? null,
         avg_rating_collaboration: aggregateRow?.avg_rating_collaboration ?? null,
         avg_rating_work_variety: aggregateRow?.avg_rating_work_variety ?? null,
         avg_rating_relationships: aggregateRow?.avg_rating_relationships ?? null,
         avg_rating_supervisor_access:
            aggregateRow?.avg_rating_supervisor_access ?? null,
         avg_rating_training: aggregateRow?.avg_rating_training ?? null,
         pct_would_recommend: aggregateRow?.pct_would_recommend ?? null,
         pct_description_accurate: aggregateRow?.pct_description_accurate ?? null,
         avg_days_per_week: aggregateRow?.avg_days_per_week ?? null,
         pct_public_transit: aggregateRow?.pct_public_transit ?? null,
         pct_overtime_required: aggregateRow?.pct_overtime_required ?? null
      };

      // Positions: query each view separately to avoid join ambiguity.
      const [omegaPositions, infoPositions] = await Promise.all([
         db
            .select()
            .from(positionOmegaMView)
            .where(eq(positionOmegaMView.company_id, company_id))
            .orderBy(sql`${positionOmegaMView.omega_score} DESC NULLS LAST`),
         db
            .select()
            .from(positionInformationMView)
            .where(eq(positionInformationMView.company_id, company_id))
      ]);

      const infoMap = new Map(
         infoPositions.map(p => [p.position_id, p])
      );

      const positions = omegaPositions.map(p => {
         const info = infoMap.get(p.position_id);
         return {
            position_id: p.position_id,
            position_name: p.position_name,
            company_id: p.company_id,
            company_name: p.company_name,
            total_reviews: p.total_reviews,
            total_submissions: info?.total_submissions ?? 0,
            avg_rating_overall: info?.avg_rating_overall ?? null,
            avg_compensation: info?.avg_compensation ?? null,
            omega_score: p.omega_score,
            satisfaction_score: p.satisfaction_score,
            trust_score: p.trust_score,
            integrity_score: p.integrity_score,
            growth_score: p.growth_score,
            work_life_score: p.work_life_score,
            most_recent_posting_year: info?.most_recent_posting_year ?? null
         };
      });

      return {
         company: companyRow as any,
         positions: positions as any
      };
   }
);

// ============================================================================
// GET /esap/companies/:company_id/reviews
// ============================================================================

export const getCompanyReviews = os.companies.getCompanyReviews.handler(
   async ({ input: { company_id, position_id, sort, pageIndex, pageSize } }) => {
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

      const whereClause = position_id
         ? and(eq(company.id, company_id), eq(position.id, position_id))
         : eq(company.id, company_id);

      const sortExpr =
         sort === 'rating_desc'
            ? sql`${position_review.rating_overall} DESC NULLS LAST, ${position_review.year} DESC`
            : sort === 'rating_asc'
              ? sql`${position_review.rating_overall} ASC NULLS LAST, ${position_review.year} DESC`
              : sql`${position_review.year} DESC, ${position_review.coop_cycle} ASC`;

      const [totalResult, data] = await Promise.all([
         db
            .select({ count: count() })
            .from(position_review)
            .innerJoin(position, eq(position_review.position_id, position.id))
            .innerJoin(company, eq(position.company_id, company.id))
            .where(whereClause)
            .then(r => Number(r[0]?.count ?? 0)),
         db
            .select(reviewFields)
            .from(position_review)
            .innerJoin(position, eq(position_review.position_id, position.id))
            .innerJoin(company, eq(position.company_id, company.id))
            .where(whereClause)
            .orderBy(sortExpr)
            .offset((pageIndex - 1) * pageSize)
            .limit(pageSize)
      ]);

      return {
         pageIndex,
         pageSize,
         count: totalResult,
         data: data as any
      };
   }
);
