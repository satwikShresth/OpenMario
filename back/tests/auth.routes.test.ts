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
import { revoked, users } from '#/db/schema.ts';
import { db } from '#db';
import { hash } from 'argon2';
import { eq } from 'drizzle-orm';

const endpoint = '/api';
const testUser = {
   username: 'testuser',
   password: 'Test123',
};

describe('Authentication API', () => {
   beforeEach(async () => {
      await db.delete(users);
      await db.delete(revoked);
   });

   afterAll(async () => {
      await db.delete(users);
      await db.delete(revoked);
   });

   describe('POST /signup', () => {
      const signupEndpoint = `${endpoint}/signup`;

      describe('Successful registration', () => {
         it('creates new user with valid credentials', async () => {
            const { data, status } = await api.post(signupEndpoint, testUser);

            expect(status).toBe(201);
            expect(Array.isArray(data)).toBe(true);
            expect(data[0]).toMatchObject({
               id: expect.any(Number),
               username: testUser.username,
            });
            expect(data[0].password).toBeDefined();
            expect(typeof data[0].password).toBe('string');

            const dbUser = await db
               .select()
               .from(users)
               .where(eq(users.username, testUser.username));
            expect(dbUser).toHaveLength(1);
            expect(dbUser[0].username).toBe(testUser.username);
         });

         it('handles special characters in username', async () => {
            const specialUser = {
               username: 'test.user@domain',
               password: 'Test123!@#',
            };

            const { data, status } = await api.post(
               signupEndpoint,
               specialUser,
            );
            expect(status).toBe(201);
            expect(data[0].username).toBe(specialUser.username);
         });
      });

      describe('Error handling', () => {
         it('rejects duplicate username', async () => {
            await api.post(signupEndpoint, testUser);

            try {
               await api.post(signupEndpoint, testUser);
            } catch (error) {
               const axiosError = error as AxiosError;
               expect(axiosError.response?.status).toBe(409);
            }
         });

         it('rejects invalid password format', async () => {
            const invalidPasswords = [
               'short',
               'nouppercaseorspecial123',
               'NOLOWERCASEORSPECIAL123',
               'NoSpecialChars123',
            ];

            for (const password of invalidPasswords) {
               try {
                  await api.post(signupEndpoint, { ...testUser, password });
               } catch (error) {
                  const axiosError = error as AxiosError;
                  expect(axiosError.response?.status).toBe(400);
                  expect(axiosError.response?.data).toHaveProperty(
                     'type',
                     'body',
                  );
               }
            }
         });
      });
   });

   describe('POST /access-token', () => {
      const loginEndpoint = `${endpoint}/access-token`;

      beforeEach(async () => {
         const hashedPassword = await hash(testUser.password);
         await db
            .insert(users)
            .values({
               username: testUser.username,
               password: hashedPassword,
            })
            .returning();
      });

      describe('Successful login', () => {
         it('returns valid access token for correct credentials', async () => {
            const { data, status } = await api.post(loginEndpoint, testUser);

            expect(status).toBe(200);
            expect(data).toHaveProperty('access_token');
            expect(data).toHaveProperty('token_type', 'bearer');
            expect(typeof data.access_token).toBe('string');
         });
      });

      describe('Error handling', () => {
         it('rejects invalid password', async () => {
            try {
               await api.post(loginEndpoint, {
                  username: testUser.username,
                  password: 'Wrongpassword1',
               });
            } catch (error) {
               const axiosError = error as AxiosError;
               expect(axiosError.response?.status).toBe(401);
               expect(axiosError.response?.data).toHaveProperty(
                  'message',
                  'Invalid Username or Password',
               );
            }
         });

         it('rejects non-existent username', async () => {
            try {
               await api.post(loginEndpoint, {
                  username: 'nonexistent',
                  password: testUser.password,
               });
            } catch (error) {
               const axiosError = error as AxiosError;
               expect(axiosError.response?.status).toBe(409);
            }
         });
      });
   });

   describe('POST /logout', () => {
      const logoutEndpoint = `${endpoint}/logout`;
      let accessToken: string;

      beforeEach(async () => {
         const hashedPassword = await hash(testUser.password);
         const [user] = await db
            .insert(users)
            .values({
               username: testUser.username,
               password: hashedPassword,
            })
            .returning();

         const { data } = await api.post(`${endpoint}/access-token`, testUser);
         accessToken = data.access_token;
         api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      });

      afterEach(() => {
         delete api.defaults.headers.common['Authorization'];
      });

      it('successfully revokes token', async () => {
         const { status, data } = await api.post(logoutEndpoint);

         expect(status).toBe(200);
         expect(data).toHaveProperty('message', 'Jwt token revoked');

         try {
            await api.post(`${endpoint}/me`);
         } catch (error) {
            const axiosError = error as AxiosError;
            expect(axiosError.response?.status).toBe(401);
         }
      });
   });

   describe('POST /me', () => {
      const testTokenEndpoint = `${endpoint}/me`;
      let accessToken: string;

      beforeEach(async () => {
         const hashedPassword = await hash(testUser.password);
         const [user] = await db
            .insert(users)
            .values({
               username: testUser.username,
               password: hashedPassword,
            })
            .returning();

         const { data } = await api.post(`${endpoint}/access-token`, testUser);
         accessToken = data.access_token;
      });

      afterEach(() => {
         delete api.defaults.headers.common['Authorization'];
      });

      it('accepts valid token', async () => {
         api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
         const { status, data } = await api.post(testTokenEndpoint);

         expect(status).toBe(200);
         expect(data).toHaveProperty('username', testUser.username);
         expect(data).toHaveProperty('user_id');
         expect(data).toHaveProperty('iat');
      });

      it('rejects request without token', async () => {
         try {
            await api.post(testTokenEndpoint);
         } catch (error) {
            const axiosError = error as AxiosError;
            expect(axiosError.response?.status).toBe(401);
         }
      });

      it('rejects invalid token format', async () => {
         api.defaults.headers.common['Authorization'] = 'Bearer invalid-token';
         try {
            await api.post(testTokenEndpoint);
         } catch (error) {
            const axiosError = error as AxiosError;
            expect(axiosError.response?.status).toBe(401);
         }
      });
   });
});
