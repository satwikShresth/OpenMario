import { api } from './index.ts';
import { expect } from 'jsr:@std/expect';
import {
   afterAll,
   afterEach,
   beforeEach,
   describe,
   it,
} from 'jsr:@std/testing/bdd';
import { authors, revoked, users } from '#/db/schema.ts';
import { db } from '#db';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';

const endpoint = `/api/authors`;
const authEndpoint = `/api`;

const testUser1 = {
   username: 'testuser1',
   password: 'Test123!@#',
};

const testUser2 = {
   username: 'testuser2',
   password: 'Test123!@#',
};

describe('Authors API Authorization', () => {
   let user1Token: string;
   let user2Token: string;
   let user1_id: number;
   let user2_id: number;
   let author1_id: number;

   beforeEach(async () => {
      // Clean up databases
      await db.delete(authors);
      await db.delete(users);
      await db.delete(revoked);

      // Create first test user
      const hashedPassword1 = await hash(testUser1.password);
      const user1 = await db
         .insert(users)
         .values({
            username: testUser1.username,
            password: hashedPassword1,
         })
         .returning();
      user1_id = user1[0].id;

      // Create second test user
      const hashedPassword2 = await hash(testUser2.password);
      const user2 = await db
         .insert(users)
         .values({
            username: testUser2.username,
            password: hashedPassword2,
         })
         .returning();
      user2_id = user2[0].id;

      // Get tokens for both users
      const response1 = await api.post(
         `${authEndpoint}/access-token`,
         testUser1,
      );
      user1Token = response1.data.access_token;

      const response2 = await api.post(
         `${authEndpoint}/access-token`,
         testUser2,
      );
      user2Token = response2.data.access_token;

      // Create an author with user1
      api.defaults.headers.common['Authorization'] = `Bearer ${user1Token}`;
      const authorResponse = await api.post(endpoint, {
         name: 'Test Author',
         bio: 'Test bio',
      });
      author1_id = authorResponse.data[0].id;
   });

   afterEach(() => {
      delete api.defaults.headers.common['Authorization'];
   });

   afterAll(async () => {
      await db.delete(authors);
      await db.delete(users);
      await db.delete(revoked);
   });

   describe('PUT /api/authors/:id authorization', () => {
      it('allows update by the user who created the author', async () => {
         api.defaults.headers.common['Authorization'] = `Bearer ${user1Token}`;
         const response = await api.put(`${endpoint}/${author1_id}`, {
            name: 'Updated Name',
            bio: 'Updated bio',
         });
         expect(response.status).toBe(200);
         expect(response.data[0]).toMatchObject({
            id: author1_id,
            name: 'Updated Name',
            bio: 'Updated bio',
         });
      });

      it('prevents update by a different user', async () => {
         api.defaults.headers.common['Authorization'] = `Bearer ${user2Token}`;
         try {
            await api.put(`${endpoint}/${author1_id}`, {
               name: 'Unauthorized Update',
               bio: 'Unauthorized bio',
            });
            throw new Error('Should not reach this point');
         } catch (error: any) {
            expect(error.response?.status).toBe(401);
            expect(error.response.data).toHaveProperty(
               'message',
               'Unauthorized Access',
            );
         }

         // Verify the author was not updated
         const author = await db
            .select()
            .from(authors)
            .where(eq(authors.id, author1_id));
         expect(author[0].name).toBe('Test Author');
         expect(author[0].bio).toBe('Test bio');
      });
   });

   describe('DELETE /api/authors/:id authorization', () => {
      it('allows deletion by the user who created the author', async () => {
         api.defaults.headers.common['Authorization'] = `Bearer ${user1Token}`;
         const response = await api.delete(`${endpoint}/${author1_id}`);
         expect(response.status).toBe(200);
         expect(response.data[0]).toHaveProperty('deleted_id', author1_id);

         // Verify the author was deleted
         const author = await db
            .select()
            .from(authors)
            .where(eq(authors.id, author1_id));
         expect(author).toHaveLength(0);
      });

      it('prevents deletion by a different user', async () => {
         api.defaults.headers.common['Authorization'] = `Bearer ${user2Token}`;
         try {
            await api.delete(`${endpoint}/${author1_id}`);
            throw new Error('Should not reach this point');
         } catch (error: any) {
            expect(error.response?.status).toBe(401);
            expect(error.response.data).toHaveProperty(
               'message',
               'Unauthorized Access',
            );
         }

         const author = await db
            .select()
            .from(authors)
            .where(eq(authors.id, author1_id));
         expect(author).toHaveLength(1);
      });
   });
});
