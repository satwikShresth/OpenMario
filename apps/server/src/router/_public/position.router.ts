import { os } from '@/router/helpers'
import { company, position } from '@openmario/db'
import { eq } from 'drizzle-orm'
import { INDEX_NAMES, type PositionDocument } from '@openmario/meilisearch'

/**
 * Create a new position for an existing company by company_id.
 */
export const createPosition = os.position.create.handler(
   async ({ input: { name: position_name, company_id }, context: { db, meilisearch } }) => {
      try {
         const [existingCompany] = await db
            .select({ id: company.id, name: company.name })
            .from(company)
            .where(eq(company.id, company_id))
            .limit(1)

         if (!existingCompany) {
            throw new Error(`Company "${company_id}" not found`)
         }

         const [newPosition] = await db
            .insert(position)
            .values({
               name: position_name,
               company_id: existingCompany.id,
               owner_id: null,
            })
            .returning({
               id: position.id,
               name: position.name,
               company_id: position.company_id,
            })

         if (!newPosition) throw new Error('Position creation failed')

         if (meilisearch) {
            const doc: PositionDocument = {
               position_id: newPosition.id,
               position_name: newPosition.name,
               company_id: newPosition.company_id,
               company_name: existingCompany.name,
            }
            await meilisearch.client
               .index<PositionDocument>(INDEX_NAMES.positions)
               .addDocuments([doc])
         }

         return {
            position: newPosition,
            message: 'Position created successfully',
         }
      } catch (error: any) {
         console.error('Error creating position:', error)
         throw new Error(error.message || 'Position creation failed')
      }
   },
)
