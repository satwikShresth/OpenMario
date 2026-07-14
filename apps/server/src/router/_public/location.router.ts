import { os } from '@/router/helpers'
import { location } from '@openmario/db'
import { and, eq } from 'drizzle-orm'
import { INDEX_NAMES, type LocationDocument } from '@openmario/meilisearch'

/**
 * Create a new location (or return existing unique city/state) and sync Meili.
 */
export const createLocation = os.location.create.handler(
   async ({
      input: { city, state, state_code },
      context: { db, meilisearch },
   }) => {
      try {
         const [existing] = await db
            .select()
            .from(location)
            .where(
               and(
                  eq(location.city, city),
                  eq(location.state, state),
                  eq(location.state_code, state_code),
               ),
            )
            .limit(1)

         const row =
            existing ??
            (
               await db
                  .insert(location)
                  .values({ city, state, state_code })
                  .returning()
            )[0]

         if (!row) throw new Error('Location creation failed')

         const label = `${row.city}, ${row.state_code}`
         if (meilisearch) {
            const doc: LocationDocument = {
               location_id: row.id,
               city: row.city,
               state: row.state,
               state_code: row.state_code,
               label,
            }
            await meilisearch.client
               .index<LocationDocument>(INDEX_NAMES.locations)
               .addDocuments([doc])
         }

         return {
            location: {
               id: row.id,
               city: row.city,
               state: row.state,
               state_code: row.state_code,
               label,
            },
            message: existing
               ? 'Location already existed'
               : 'Location created successfully',
         }
      } catch (error: any) {
         console.error('Error creating location:', error)
         throw new Error(error.message || 'Location creation failed')
      }
   },
)
