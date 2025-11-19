import { os } from './context';
import { db, company } from '@/db';

/**
 * Create a new company
 */
export const createCompany = os.company.create.handler(
   async ({ input: { name: company_name } }) => {
      return await db
         .transaction(
            async tx =>
               await tx
                  .insert(company)
                  .values({ name: company_name, owner_id: null })
                  .returning({
                     id: company.id,
                     name: company.name
                  })
         )
         .then(([company]) => ({
            company: company!,
            message: 'Company created successfully'
         }))
         .catch(error => {
            console.error('Error creating company:', error);
            throw new Error(error.message || 'Company creation failed');
         });
   }
);
