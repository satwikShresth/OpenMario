import { AxiosError } from "axios";
import { authors } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { Author } from "../db/types.js";
import { api } from "../server.test.js";

const endpoint = `/api/authors`

beforeEach(async () => {
    await db.delete(authors);
});

afterAll(async () => {
    await db.delete(authors);
});


describe(endpoint, () => {
    describe('GET', () => {
        describe('when authors exist', () => {
            test("returns all authors", async () => {
                const testAuthor = await db.insert(authors).values({
                    name: "J.K. Rowling",
                    bio: "British author"
                }).returning();

                const { data } = await api.get(endpoint);
                expect(data).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: testAuthor[0].name,
                        bio: testAuthor[0].bio
                    })
                ]));
                expect(data[0].id).toBeGreaterThan(0);
            });

            test("returns multiple authors in correct order", async () => {
                const testAuthors = await db.insert(authors).values([
                    { name: "Author 1", bio: "Bio 1" },
                    { name: "Author 2", bio: "Bio 2" },
                    { name: "Author 3", bio: "Bio 3" }
                ]).returning();

                const { data } = await api.get(endpoint);
                expect(data).toHaveLength(3);
                expect(data).toEqual(expect.arrayContaining(
                    testAuthors.map(author => expect.objectContaining({
                        id: expect.any(Number),
                        name: author.name,
                        bio: author.bio
                    }))
                ));
                data.forEach((author: Author) => {
                    expect(author.id).toBeGreaterThan(0);
                });
            });
        });

        describe('when no authors exist', () => {
            test("returns empty array", async () => {
                const { data } = await api.get(endpoint);
                expect(data).toEqual([]);
            });
        });
    });

    describe('POST', () => {
        describe('with valid data', () => {
            test("creates new author with complete data", async () => {
                const newAuthor = {
                    name: "Stephen King",
                    bio: "Master of horror"
                };

                const { data, status } = await api.post(endpoint, newAuthor);
                expect(status).toEqual(201);
                expect(Array.isArray(data)).toBe(true);
                expect(data[0]).toMatchObject({
                    ...newAuthor,
                    id: expect.any(Number)
                });
                expect(data[0].id).toBeGreaterThan(0);

                const dbAuthor = await db.select().from(authors).where(eq(authors.name, "Stephen King"));
                expect(dbAuthor[0]).toMatchObject({
                    ...newAuthor,
                    id: data[0].id
                });
            });

            test("handles empty bio field", async () => {
                const authorWithEmptyBio = {
                    name: "John Doe",
                    bio: ""
                };

                const { data, status } = await api.post(endpoint, authorWithEmptyBio);
                expect(status).toEqual(201);
                expect(Array.isArray(data)).toBe(true);
                expect(data[0]).toMatchObject({
                    ...authorWithEmptyBio,
                    id: expect.any(Number)
                });
                expect(data[0].id).toBeGreaterThan(0);

                const dbAuthor = await db.select().from(authors).where(eq(authors.name, "John Doe"));
                expect(dbAuthor[0]).toMatchObject({
                    ...authorWithEmptyBio,
                    id: data[0].id
                });
            });

            test("handles very long bio text", async () => {
                const longBio = "A".repeat(1000);
                const authorWithLongBio = {
                    name: "Long Bio Author",
                    bio: longBio
                };

                const { data, status } = await api.post(endpoint, authorWithLongBio);
                expect(status).toEqual(201);
                expect(Array.isArray(data)).toBe(true);
                expect(data[0]).toMatchObject({
                    ...authorWithLongBio,
                    id: expect.any(Number)
                });
                expect(data[0].id).toBeGreaterThan(0);

                const dbAuthor = await db.select().from(authors).where(eq(authors.name, "Long Bio Author"));
                expect(dbAuthor[0]).toMatchObject({
                    ...authorWithLongBio,
                    id: data[0].id
                });
            });

            test("handles special characters in name and bio", async () => {
                const authorWithSpecialChars = {
                    name: "José María O'Connor-Smith",
                    bio: "Bio with émojis 🎉 and symbols @#$%"
                };

                const { data, status } = await api.post(endpoint, authorWithSpecialChars);
                expect(status).toEqual(201);
                expect(Array.isArray(data)).toBe(true);
                expect(data[0]).toMatchObject({
                    ...authorWithSpecialChars,
                    id: expect.any(Number)
                });
                expect(data[0].id).toBeGreaterThan(0);

                const dbAuthor = await db.select().from(authors).where(eq(authors.name, authorWithSpecialChars.name));
                expect(dbAuthor[0]).toMatchObject({
                    ...authorWithSpecialChars,
                    id: data[0].id
                });
            });
        });

        describe('with invalid data', () => {
            test("returns error for missing name field", async () => {
                const invalidAuthor = {
                    bio: "Missing name field"
                };

                try {
                    await api.post(endpoint, invalidAuthor);
                } catch (error) {
                    const errorObj = error as AxiosError;
                    if (errorObj.response === undefined) {
                        throw errorObj;
                    }
                    const { response } = errorObj;
                    expect(response.status).toEqual(400);
                    expect(response.data).toHaveProperty("type", "Body");
                    expect(response.data).toHaveProperty("errors");
                }

                const dbAuthor = await db.select().from(authors);
                expect(dbAuthor).toHaveLength(0);
            });

            test("rejects empty name field", async () => {
                const authorWithEmptyName = {
                    name: "",
                    bio: "Some bio"
                };

                try {
                    await api.post(endpoint, authorWithEmptyName);
                } catch (error) {
                    const errorObj = error as AxiosError;
                    if (errorObj.response === undefined) {
                        throw errorObj;
                    }
                    const { response } = errorObj;
                    expect(response.status).toEqual(400);
                    expect(response.data).toHaveProperty("type", "Body");
                    expect(response.data).toHaveProperty("errors");
                }
            });

            test("rejects missing required fields", async () => {
                const invalidCases = [
                    {},
                    { name: null },
                    { name: undefined },
                    { bio: "Just a bio" }
                ];

                for (const invalidCase of invalidCases) {
                    try {
                        await api.post(endpoint, invalidCase);
                    } catch (error) {
                        const errorObj = error as AxiosError;
                        if (errorObj.response === undefined) {
                            throw errorObj;
                        }
                        const { response } = errorObj;
                        expect(response.status).toEqual(400);
                        expect(response.data).toHaveProperty("type", "Body");
                        expect(response.data).toHaveProperty("errors");
                    }
                }

                const dbAuthor = await db.select().from(authors);
                expect(dbAuthor).toHaveLength(0);
            });
        });
    });
});
