import { api } from './index.ts';
import { expect } from 'jsr:@std/expect';
import {
   afterAll,
   afterEach,
   beforeEach,
   describe,
   it,
} from 'jsr:@std/testing/bdd';
import { AxiosError } from 'axios';
import { authors, books, revoked, users } from '#/db/schema.ts';
import { eq } from 'drizzle-orm';
import { db } from '#db';
import { Book, BookCreate } from '#models';
import { hash } from 'argon2';

const endpoint = `/api/books`;
const authEndpoint = '/api';

const testUser = {
   username: 'testuser',
   password: 'Test123!@#',
};

const testAuthor = {
   name: 'Test Author',
   bio: 'Test author bio',
};

const testBooks = [
   {
      title: 'Test Book 1',
      pub_year: '2020',
      genre: 'Fiction',
      author_name: 'Test Author',
      author_bio: 'Test author bio',
   },
   {
      title: 'Test Book 2',
      pub_year: '2021',
      genre: 'Mystery',
      author_name: 'Test Author',
      author_bio: 'Test author bio',
   },
   {
      title: 'Test Book 3',
      pub_year: '2022',
      genre: 'Science Fiction',
      author_name: 'Test Author',
      author_bio: 'Test author bio',
   },
];

describe('Books API', () => {
   let accessToken: string;
   let user_id: number;

   beforeEach(async () => {
      // Clean up databases
      await db.delete(books);
      await db.delete(authors);
      await db.delete(users);
      await db.delete(revoked);

      // Create test user
      const hashedPassword = await hash(testUser.password);
      const returnedValue = await db
         .insert(users)
         .values({
            username: testUser.username,
            password: hashedPassword,
         })
         .returning();

      user_id = returnedValue[0].id;

      // Login and get token
      const { data } = await api.post(`${authEndpoint}/access-token`, testUser);
      accessToken = data.access_token;
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
   });

   afterEach(() => {
      delete api.defaults.headers.common['Authorization'];
   });

   afterAll(async () => {
      await db.delete(books);
      await db.delete(authors);
      await db.delete(users);
      await db.delete(revoked);
   });

   describe('GET /api/books', () => {
      describe('Basic retrieval', () => {
         it('returns empty array when no books exist', async () => {
            const { data } = await api.get(endpoint);
            expect(data).toEqual([]);
         });

         it('retrieves single book when database has one entry', async () => {
            const author = await db.insert(authors).values({
               ...testAuthor,
               user_id,
            })
               .returning();
            const testBook = await db.insert(books).values({
               title: 'Test Book',
               pub_year: '2023',
               genre: 'Fiction',
               author_id: author[0].id,
               user_id,
            }).returning();

            const { data } = await api.get(endpoint);
            expect(data).toEqual(expect.arrayContaining([
               expect.objectContaining({
                  id: expect.any(Number),
                  title: testBook[0].title,
                  pub_year: testBook[0].pub_year,
                  genre: testBook[0].genre,
                  author_id: author[0].id,
               }),
            ]));
            expect(data[0].id).toBeGreaterThan(0);
         });

         it('returns multiple books in correct order', async () => {
            const author = await db.insert(authors).values({
               ...testAuthor,
               user_id,
            })
               .returning();
            const insertedBooks = await db.insert(books).values(
               testBooks.map((book) => ({
                  title: book.title,
                  pub_year: book.pub_year,
                  genre: book.genre,
                  author_id: author[0].id,
                  user_id,
               })),
            ).returning();

            const { data } = await api.get(endpoint);
            expect(data).toHaveLength(3);
            expect(data).toEqual(expect.arrayContaining(
               insertedBooks.map((book) =>
                  expect.objectContaining({
                     id: expect.any(Number),
                     title: book.title,
                     pub_year: book.pub_year,
                     genre: book.genre,
                     author_id: author[0].id,
                  })
               ),
            ));
            data.forEach((book: Book) => {
               expect(book.id).toBeGreaterThan(0);
            });
         });
      });

      describe('Filtering', () => {
         beforeEach(async () => {
            const author = await db.insert(authors).values({
               ...testAuthor,
               user_id,
            })
               .returning();
            await db.insert(books).values(
               testBooks.map((book) => ({
                  title: book.title,
                  pub_year: book.pub_year,
                  genre: book.genre,
                  author_id: author[0].id,
                  user_id,
               })),
            );
         });

         it('filters books by title query parameter', async () => {
            const { data } = await api.get(endpoint, {
               params: { title: 'Book 1' },
            });
            expect(data).toHaveLength(1);
            expect(
               data.every((book: Book) =>
                  book.title.toLowerCase().includes('book 1')
               ),
            ).toBe(true);
         });

         it('filters books by genre query parameter', async () => {
            const { data } = await api.get(endpoint, {
               params: { genre: 'Fiction' },
            });
            expect(data).toHaveLength(1);
            expect(
               data.every((book: Book) => book.genre === 'Fiction'),
            ).toBe(true);
         });

         it('filters books by pub_year query parameter', async () => {
            const { data } = await api.get(endpoint, {
               params: { pub_year: '2020' },
            });
            expect(data).toHaveLength(1);
            expect(
               data.every((book: Book) => book.pub_year === '2020'),
            ).toBe(true);
         });

         it('returns empty array for non-matching search', async () => {
            const { data } = await api.get(endpoint, {
               params: { title: 'NonExistent' },
            });
            expect(data).toHaveLength(0);
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

   describe('POST /api/books', () => {
      describe('Successful creation', () => {
         it('creates new book with complete data and new author', async () => {
            const newBook: Partial<BookCreate> = {
               title: 'New Book',
               pub_year: '2023',
               genre: 'Fiction',
               author_name: 'New Author',
               author_bio: 'New author bio',
               user_id,
            };

            const { data, status } = await api.post(endpoint, newBook);
            expect(status).toEqual(201);
            expect(Array.isArray(data)).toBe(true);
            expect(data[0]).toMatchObject({
               title: newBook.title,
               pub_year: newBook.pub_year,
               genre: newBook.genre,
               user_id: expect.any(Number),
               id: expect.any(Number),
               author_id: expect.any(Number),
            });

            // Verify author was created
            const dbAuthor = await db.select().from(authors).where(
               eq(authors.name, newBook.author_name!),
            );
            expect(dbAuthor).toHaveLength(1);
            expect(dbAuthor[0].bio).toBe(newBook.author_bio);
         });

         it('creates new book with existing author', async () => {
            const existingAuthor = await db.insert(authors).values({
               ...testAuthor,
               user_id,
            })
               .returning();
            const newBook: Partial<BookCreate> = {
               title: 'New Book',
               pub_year: '2023',
               genre: 'Fiction',
               author_name: testAuthor.name,
               author_bio: testAuthor.bio,
               user_id,
            };

            const { data } = await api.post(endpoint, newBook);
            expect(data[0]).toMatchObject({
               title: newBook.title,
               pub_year: newBook.pub_year,
               genre: newBook.genre,
               author_id: existingAuthor[0].id,
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
               expect(errorObj.response.status).toEqual(400);
               expect(errorObj.response.data).toHaveProperty('type', 'body');
            }
         };

         it('returns error for missing title', async () => {
            await testInvalidCases({
               pub_year: '2023',
               genre: 'Fiction',
               author_name: 'Test Author',
            });
         });

         it('returns error for invalid genre', async () => {
            await testInvalidCases({
               title: 'Test Book',
               pub_year: '2023',
               genre: 'InvalidGenre',
               author_name: 'Test Author',
            });
         });

         it('returns error for invalid publication year', async () => {
            await testInvalidCases({
               title: 'Test Book',
               pub_year: '999999',
               genre: 'Fiction',
               author_name: 'Test Author',
            });
         });

         it('returns error for missing author name', async () => {
            await testInvalidCases({
               title: 'Test Book',
               pub_year: '2023',
               genre: 'Fiction',
            });
         });
      });
   });

   describe('PUT /api/books/:id', () => {
      let testBook: Book[];

      beforeEach(async () => {
         const author = await db.insert(authors).values({
            ...testAuthor,
            user_id,
         }).returning();
         testBook = await db.insert(books).values({
            title: 'Original Title',
            pub_year: '2023',
            genre: 'Fiction',
            author_id: author[0].id,
            user_id,
         }).returning();
      });

      it('successfully updates an existing book', async () => {
         const updateData = {
            title: 'Updated Title',
            pub_year: '2022',
            genre: 'Mystery',
            author_name: 'Updated Author',
            author_bio: 'Updated bio',
         };

         const { data } = await api.put(
            `${endpoint}/${testBook[0].id}`,
            updateData,
         );

         expect(Array.isArray(data)).toBe(true);
         expect(data[0]).toMatchObject({
            id: testBook[0].id,
            title: updateData.title,
            pub_year: updateData.pub_year,
            genre: updateData.genre,
         });
      });

      it('handles partial updates correctly', async () => {
         const partialUpdate = {
            title: 'Updated Title Only',
         };

         const { data } = await api.put(
            `${endpoint}/${testBook[0].id}`,
            partialUpdate,
         );

         expect(data[0]).toMatchObject({
            id: testBook[0].id,
            title: partialUpdate.title,
            pub_year: testBook[0].pub_year,
            genre: testBook[0].genre,
         });
      });

      it('returns 404 for updating non-existent book', async () => {
         try {
            await api.put(`${endpoint}/999999`, { title: 'New Title' });
         } catch (error: any) {
            expect(error.response.status).toBe(404);
         }
      });
   });

   describe('DELETE /api/books/:id', () => {
      it('successfully deletes an existing book', async () => {
         const author = await db.insert(authors).values({
            ...testAuthor,
            user_id,
         }).returning();
         const testBook = await db.insert(books).values({
            title: 'To Be Deleted',
            pub_year: '2023',
            genre: 'Fiction',
            author_id: author[0].id,
            user_id,
         }).returning();

         const { data } = await api.delete(`${endpoint}/${testBook[0].id}`);
         expect(data[0]).toHaveProperty('deleted_id', testBook[0].id);

         const dbBook = await db
            .select()
            .from(books)
            .where(eq(books.id, testBook[0].id));
         expect(dbBook).toHaveLength(0);
      });

      it('returns 404 for deleting non-existent book', async () => {
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
