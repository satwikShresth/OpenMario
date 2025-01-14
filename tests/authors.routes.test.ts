import { api } from './index.ts';
import { expect } from 'jsr:@std/expect';
import { afterAll, beforeEach, describe, it } from 'jsr:@std/testing/bdd';
import { AxiosError } from 'axios';
import { authors } from '#/db/schema.ts';
import { eq } from 'drizzle-orm';
import { db } from '#/db/index.ts';
import { Author } from '#/db/types.ts';

const endpoint = `/api/authors`;

const testAuthors = [
   { name: 'John Smith', bio: 'Mystery writer from London' },
   { name: 'Jane Doe', bio: 'Science fiction author' },
   { name: 'John Doe', bio: 'Technical writer' },
   { name: 'Sarah Wilson', bio: 'Romance novelist from Paris' },
];

describe('Authors API', () => {
   beforeEach(async () => {
      await db.delete(authors);
   });

   afterAll(async () => {
      await db.delete(authors);
   });

   describe('GET /api/authors', () => {
      describe('Basic retrieval', () => {
         it('returns empty array when no authors exist', async () => {
            const { data } = await api.get(endpoint);
            expect(data).toEqual([]);
         });

         it('retrieves single author when database has one entry', async () => {
            const testAuthor = await db.insert(authors).values({
               name: 'J.K. Rowling',
               bio: 'British author',
            }).returning();

            const { data } = await api.get(endpoint);
            expect(data).toEqual(expect.arrayContaining([
               expect.objectContaining({
                  id: expect.any(Number),
                  name: testAuthor[0].name,
                  bio: testAuthor[0].bio,
               }),
            ]));
            expect(data[0].id).toBeGreaterThan(0);
         });

         it('returns multiple authors in correct order', async () => {
            const testAuthors = await db.insert(authors).values([
               { name: 'Author 1', bio: 'Bio 1' },
               { name: 'Author 2', bio: 'Bio 2' },
               { name: 'Author 3', bio: 'Bio 3' },
            ]).returning();

            const { data } = await api.get(endpoint);
            expect(data).toHaveLength(3);
            expect(data).toEqual(expect.arrayContaining(
               testAuthors.map((author) =>
                  expect.objectContaining({
                     id: expect.any(Number),
                     name: author.name,
                     bio: author.bio,
                  })
               ),
            ));
            data.forEach((author: Author) => {
               expect(author.id).toBeGreaterThan(0);
            });
         });
      });

      describe('Filtering', () => {
         beforeEach(async () => {
            await db.insert(authors).values(testAuthors);
         });

         it('filters authors by name query parameter', async () => {
            const { data } = await api.get(endpoint, {
               params: { name: 'John' },
            });
            expect(data).toHaveLength(2);
            expect(
               data.every((author: Author) =>
                  author.name.toLowerCase().includes('john')
               ),
            ).toBe(true);
         });

         it('filters authors by bio query parameter', async () => {
            const { data } = await api.get(endpoint, {
               params: { bio: 'writer' },
            });
            expect(data).toHaveLength(2);
            expect(
               data.every((author: Author) =>
                  author?.bio?.toLowerCase()?.includes('writer')
               ),
            ).toBe(true);
         });

         it('filters authors by multiple query parameters', async () => {
            const { data } = await api.get(endpoint, {
               params: { name: 'John', bio: 'writer' },
            });
            expect(
               data.every((author: Author) =>
                  author.name.toLowerCase().includes('john') &&
                  author?.bio?.toLowerCase()?.includes('writer')
               ),
            ).toBe(true);
         });

         it('returns empty array for non-matching search', async () => {
            const { data } = await api.get(endpoint, {
               params: { name: 'NonExistent' },
            });
            expect(data).toHaveLength(0);
         });

         it('handles partial name matches', async () => {
            const { data } = await api.get(endpoint, {
               params: { name: 'Jo' },
            });
            expect(data.length).toBeGreaterThan(0);
            expect(
               data.every((author: Author) =>
                  author.name.toLowerCase().includes('jo')
               ),
            ).toBe(true);
         });

         it('returns all authors when query parameter is invalid', async () => {
            const { data } = await api.get(endpoint, {
               params: { unknown: 'value' },
            });
            expect(Array.isArray(data)).toBe(true);
            expect(data).toHaveLength(testAuthors.length);
         });
      });

      describe('Error handling', () => {
         it('returns 400 for invalid ID format', async () => {
            try {
               await api.get(`${endpoint}/invalid`);
            } catch (error: any) {
               expect(error.response.status).toBe(400);
               expect(error.response.data).toHaveProperty('type', 'params');
            }
         });

         it('returns 404 for non-existent ID', async () => {
            try {
               await api.get(`${endpoint}/999999`);
            } catch (error: any) {
               expect(error.response.status).toBe(404);
            }
         });
      });
   });

   describe('GET /api/authors/:id', () => {
      it('successfully retrieves an author by ID', async () => {
         const testAuthor = await db.insert(authors).values({
            name: 'J.K. Rowling',
            bio: 'British author',
         }).returning();

         const { data } = await api.get(`${endpoint}/${testAuthor[0].id}`);
         expect(Array.isArray(data)).toBe(true);
         expect(data[0]).toMatchObject({
            id: testAuthor[0].id,
            name: testAuthor[0].name,
            bio: testAuthor[0].bio,
         });
      });

      it('returns 404 for non-existent author ID', async () => {
         try {
            await api.get(`${endpoint}/999999`);
         } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data).toHaveProperty(
               'detail',
               'Author not found',
            );
         }
      });

      it('returns 400 for invalid ID format', async () => {
         try {
            await api.get(`${endpoint}/invalid-id`);
         } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('type', 'params');
         }
      });
   });

   describe('POST /api/authors', () => {
      describe('Successful creation', () => {
         it('creates new author with complete data', async () => {
            const newAuthor = {
               name: 'Stephen King',
               bio: 'Master of horror',
            };
            const { data, status } = await api.post(endpoint, newAuthor);
            expect(status).toEqual(201);
            expect(Array.isArray(data)).toBe(true);
            expect(data[0]).toMatchObject({
               ...newAuthor,
               id: expect.any(Number),
            });
            expect(data[0].id).toBeGreaterThan(0);

            const dbAuthor = await db.select().from(authors).where(
               eq(authors.name, 'Stephen King'),
            );
            expect(dbAuthor[0]).toMatchObject({
               ...newAuthor,
               id: data[0].id,
            });
         });

         it('handles empty bio field by setting it to null', async () => {
            const authorWithEmptyBio = {
               name: 'John Doe',
               bio: '',
            };
            const { data, status } = await api.post(
               endpoint,
               authorWithEmptyBio,
            );
            expect(status).toEqual(201);
            expect(data[0]).toMatchObject({
               name: authorWithEmptyBio.name,
               bio: null,
               id: expect.any(Number),
            });

            const dbAuthor = await db.select().from(authors).where(
               eq(authors.name, 'John Doe'),
            );
            expect(dbAuthor[0]).toMatchObject({ ...data[0] });
         });

         it('handles special characters in name and bio', async () => {
            const authorWithSpecialChars = {
               name: "José María O'Connor Smith",
               bio: 'Bio with symbols @#$%',
            };
            const { data, status } = await api.post(
               endpoint,
               authorWithSpecialChars,
            );
            expect(status).toEqual(201);
            expect(data[0]).toMatchObject({
               ...authorWithSpecialChars,
               id: expect.any(Number),
            });

            const dbAuthor = await db.select().from(authors).where(
               eq(authors.name, authorWithSpecialChars.name),
            );
            expect(dbAuthor[0]).toMatchObject({
               ...authorWithSpecialChars,
               id: data[0].id,
            });
         });
      });

      describe('Error handling', () => {
         const testInvalidCases = async (invalidCase: any) => {
            try {
               await api.post(endpoint, invalidCase);
            } catch (error) {
               const errorObj = error as AxiosError;
               if (errorObj.response === undefined) {
                  throw errorObj;
               }
               const { response } = errorObj;
               expect(response.status).toEqual(400);
               expect(response.data).toHaveProperty('type', 'body');
               expect(response.data).toHaveProperty('errors');
            }
            // Verify no authors were created
            const dbAuthors = await db.select().from(authors);
            const matchingAuthors = dbAuthors.filter((author) =>
               Object.entries(invalidCase).every(([key, value]) =>
                  author[key as keyof typeof author] === value
               )
            );
            expect(matchingAuthors).toHaveLength(0);
         };

         it('returns error for missing name field', async () => {
            await testInvalidCases({ bio: 'Missing name field' });
         });

         it('rejects empty name field', async () => {
            await testInvalidCases({ name: '', bio: 'Some bio' });
         });

         it('rejects requests with missing required fields', async () => {
            const invalidCases = [
               {},
               { name: null },
               { name: undefined },
               { bio: 'Just a bio' },
            ];
            for (const invalidCase of invalidCases) {
               await testInvalidCases(invalidCase);
            }
         });
      });
   });

   describe('PUT /api/authors/:id', () => {
      let testAuthor: Author[];

      beforeEach(async () => {
         testAuthor = await db.insert(authors).values({
            name: 'Original Name',
            bio: 'Original bio',
         }).returning();
      });

      it('successfully updates an existing author', async () => {
         const updateData = {
            name: 'Updated Name',
            bio: 'Updated bio',
         };

         const { data } = await api.put(
            `${endpoint}/${testAuthor[0].id}`,
            updateData,
         );

         expect(Array.isArray(data)).toBe(true);
         expect(data[0]).toMatchObject({
            id: testAuthor[0].id,
            ...updateData,
         });

         const dbAuthor = await db
            .select()
            .from(authors)
            .where(eq(authors.id, testAuthor[0].id));
         expect(dbAuthor[0]).toMatchObject({
            id: testAuthor[0].id,
            ...updateData,
         });
      });

      it('handles partial updates correctly', async () => {
         const partialUpdate = {
            bio: 'Updated bio only',
         };

         const { data } = await api.put(
            `${endpoint}/${testAuthor[0].id}`,
            partialUpdate,
         );

         expect(data[0]).toMatchObject({
            id: testAuthor[0].id,
            name: testAuthor[0].name,
            bio: partialUpdate.bio,
         });
      });

      it('validates updated name format', async () => {
         const invalidUpdate = {
            name: '123Invalid@Name',
         };

         try {
            await api.put(`${endpoint}/${testAuthor[0].id}`, invalidUpdate);
         } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('type', 'body');
         }
      });

      it('returns 404 for updating non-existent author', async () => {
         try {
            await api.put(`${endpoint}/999999`, { name: 'New Name' });
         } catch (error: any) {
            expect(error.response.status).toBe(404);
         }
      });
   });

   describe('DELETE /api/authors/:id', () => {
      it('successfully deletes an existing author', async () => {
         const testAuthor = await db.insert(authors).values({
            name: 'To Be Deleted',
            bio: 'Soon to be gone',
         }).returning();

         const { data } = await api.delete(`${endpoint}/${testAuthor[0].id}`);
         expect(data[0]).toHaveProperty('deleted_id', testAuthor[0].id);

         const dbAuthor = await db
            .select()
            .from(authors)
            .where(eq(authors.id, testAuthor[0].id));
         expect(dbAuthor).toHaveLength(0);
      });

      it('returns 404 for deleting non-existent author', async () => {
         try {
            await api.delete(`${endpoint}/999999`);
         } catch (error: any) {
            expect(error.response.status).toBe(404);
         }
      });

      it('returns 400 for invalid ID format in delete request', async () => {
         try {
            await api.delete(`${endpoint}/invalid-id`);
         } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('type', 'params');
         }
      });
   });
});
