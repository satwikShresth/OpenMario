import { os } from '@/router/helpers';
import { db, company, position } from '@/db';
import { eq } from 'drizzle-orm';

/**
 * Create a new position for an existing company
 */
export const createPosition = os.position.create.handler(
   async ({ input: { name: position_name, company: company_name } }) => {
      return await db
         .transaction(async tx => {
            // First, find the company by name
            const existingCompanies = await tx
               .select({ id: company.id })
               .from(company)
               .where(eq(company.name, company_name))
               .limit(1);

            if (existingCompanies.length === 0) {
               throw new Error(`Company "${company_name}" not found`);
            }

            const [existingCompany] = existingCompanies;

            // Then create the position
            return await tx
               .insert(position)
               .values({
                  name: position_name,
                  company_id: existingCompany?.id!,
                  owner_id: null
               })
               .returning({
                  id: position.id,
                  name: position.name,
                  company_id: position.company_id
               });
         })
         .then(([newPosition]) => ({
            position: newPosition!,
            message: 'Position created successfully'
         }))
         .catch(error => {
            console.error('Error creating position:', error);
            throw new Error(error.message || 'Position creation failed');
         });
   }
);
