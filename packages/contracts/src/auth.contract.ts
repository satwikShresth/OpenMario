import { oc } from '@orpc/contract';
import z from 'zod';

const SearchTokenResponseSchema = z.object({
   token: z.string()
});

export const getSearchToken = oc
   .route({
      method: 'GET',
      path: '/meili/search-token',
      summary: 'Get search token',
      description:
         'Get a tenant token for Meilisearch searching, filtering, and sorting (expires in 1 day)',
      tags: ['Auth']
   })
   .output(SearchTokenResponseSchema);

export const authContract = {
   getSearchToken
};
