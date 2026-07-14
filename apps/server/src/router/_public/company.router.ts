import { os } from '@/router/helpers'
import { company } from '@openmario/db'
import { INDEX_NAMES, type CompanyDocument } from '@openmario/meilisearch'

/**
 * Create a new company and sync a minimal document to Meilisearch.
 */
export const createCompany = os.company.create.handler(
   async ({ input: { name: company_name }, context: { db, meilisearch } }) => {
      try {
         const [created] = await db
            .insert(company)
            .values({ name: company_name, owner_id: null })
            .returning({
               id: company.id,
               name: company.name,
            })

         if (!created) throw new Error('Company creation failed')

         if (meilisearch) {
            const doc: CompanyDocument = {
               company_id: created.id,
               company_name: created.name,
               positions: [],
               total_reviews: 0,
               positions_reviewed: 0,
               total_submissions: 0,
               omega_score: null,
               satisfaction_score: null,
               trust_score: null,
               integrity_score: null,
               growth_score: null,
               work_life_score: null,
               avg_rating_overall: null,
               avg_compensation: null,
               median_compensation: null,
               pct_would_recommend: null,
               pct_description_accurate: null,
               avg_days_per_week: null,
               pct_overtime_required: null,
               first_review_year: null,
               last_review_year: null,
            }
            await meilisearch.client
               .index<CompanyDocument>(INDEX_NAMES.companies)
               .addDocuments([doc])
         }

         return {
            company: created,
            message: 'Company created successfully',
         }
      } catch (error: any) {
         console.error('Error creating company:', error)
         throw new Error(error.message || 'Company creation failed')
      }
   },
)
