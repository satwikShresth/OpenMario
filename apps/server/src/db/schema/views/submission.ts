import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { eq, sql } from 'drizzle-orm';
import { submission, company, position, location } from '../tables';

export const submissionMView = pgMaterializedView('submission_m_view')
   .with({ fillfactor: 90 })
   .as(qb =>
      qb
         .select({
            id: submission.id,
            year: submission.year,
            coop_year: submission.coop_year,
            coop_cycle: submission.coop_cycle,
            program_level: submission.program_level,
            work_hours: submission.work_hours,
            compensation: submission.compensation,
            other_compensation: submission.other_compensation,
            details: submission.details,
            owner_id: submission.owner_id,
            created_at: submission.created_at,
            company_name: sql`${company.name}`.as('company_name'),
            position_name: sql`${position.name}`.as('position_name'),
            city: sql`${location.city}`.as('city'),
            state: sql`${location.state}`.as('state'),
            state_code: sql`${location.state_code}`.as('state_code'),
            search_text: sql<string>`
          coalesce(${company.name}, '')                  || ' ' ||
          coalesce(${position.name}, '')                 || ' ' ||
          coalesce(${location.city}, '')                 || ' ' ||
          coalesce(${location.state}, '')                || ' ' ||
          coalesce(${location.state_code}, '')           || ' ' ||
          coalesce(${submission.details}, '')            || ' ' ||
          coalesce(${submission.other_compensation}, '')
        `.as('search_text')
         })
         .from(submission)
         .leftJoin(position, eq(submission.position_id, position.id))
         .leftJoin(location, eq(submission.location_id, location.id))
         .leftJoin(company, eq(position.company_id, company.id))
   );
