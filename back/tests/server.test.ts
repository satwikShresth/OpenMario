import { api } from './index.ts';
import { expect } from 'jsr:@std/expect';
import { describe, it } from 'jsr:@std/testing/bdd';

describe('Basic Express Middleware Tests:', () => {
   it('should return 404 with error message for non-existent routes', async () => {
      try {
         await api.get('/non-existent-route');
      } catch (error: any) {
         expect(error.response.status).toBe(404);
         expect(error.response.data).toHaveProperty('message');
         expect(error.response.data.message).toContain(
            'Not Found: /api/v1/non-existent-route',
         );
      }
   });
});
