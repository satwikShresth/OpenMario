import { os } from '@/router/helpers';

/**
 * Get Meilisearch tenant token for search operations
 */
export const getSearchToken = os.auth.getSearchToken.handler(async ({ context: { meilisearch } }) => {
   return await meilisearch!
      .getTenantToken()
      .then(token => {
         if (!token) {
            throw new Error('Failed to generate tenant token');
         }
         return { token };
      })
      .catch(error => {
         console.error('Error generating Meilisearch tenant token:', error);
         throw new Error('Failed to generate search token');
      });
});
