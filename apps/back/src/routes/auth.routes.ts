import { z } from 'zod';
import { Hono } from 'hono';
import { meilisearchService } from '#/services/meilisearch.service.ts';
import {
   DescribeRouteBase,
   type DescribleRoute,
   ErrorResponseSchema,
   SuccessResponseSchema,
} from '#models';

// Define response schemas for auth routes
const SearchTokenResponseSchema = z
   .object({
      token: z.string(),
   })
   .meta({ id: 'SearchTokenResponse' });

const TokenErrorResponseSchema = z
   .object({
      message: z.string(),
      details: z.string(),
   })
   .meta({ id: 'TokenErrorResponse' });

// Single helper function for all auth route descriptions
const DescribeAuthRoute = ({
   description,
   tags = ['Auth'],
   responses = {},
}: DescribleRoute) =>
   DescribeRouteBase({
      description,
      tags,
      responses: {
         '200': {
            description: 'Success',
            schema: SuccessResponseSchema,
         },
         '401': {
            description: 'Unauthorized',
            schema: TokenErrorResponseSchema,
         },
         '409': {
            description: 'Conflict',
            schema: ErrorResponseSchema,
         },
         '500': {
            description: 'Internal server error',
            schema: ErrorResponseSchema,
         },
         ...responses,
      },
   });

export default () => {
   const router = new Hono().basePath('/auth');

   /**
    * GET /auth/search-token
    * Get a tenant token for searching, filtering, and sorting (expires in 1 day)
    */
   router.get(
      '/search-token',
      DescribeAuthRoute({
         description: 'Get a tenant token for searching, filtering, and sorting (expires in 1 day)',
         tags: ['Meilisearch'],
         responses: {
            '200': {
               description: 'Successfully generated tenant token',
               schema: SearchTokenResponseSchema,
            },
         },
      }),
      async (c) =>
         await meilisearchService
            .getTenantToken()
            .then((token) =>
               !token
                  ? c.json({ message: 'Failed to generate tenant token' }, 500)
                  : c.json({ token }, 200)
            )
            .catch((error) => {
               console.error('Error generating Meilisearch tenant token:', error);
               return c.json({ message: 'Internal server error' }, 500);
            }),
   );

   return router;
};
