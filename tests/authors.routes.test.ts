import { api } from './index.ts';
import { expect } from "jsr:@std/expect";
import { describe, it, beforeEach, afterAll } from "jsr:@std/testing/bdd";
import { AxiosError } from 'axios';
import { authors } from '#db/schema.ts';
import { eq } from 'drizzle-orm';
import { db } from '#db/index.ts';
import { Author } from '#db/types.ts';

const endpoint = `/api/authors`;

describe('Author API Endpoints: /api/authors', () => {
  beforeEach(async () => {
    await db.delete(authors);
  });

  afterAll(async () => {
    await db.delete(authors);
  });

  const testAuthors = [
    { name: 'John Smith', bio: 'Mystery writer from London' },
    { name: 'Jane Doe', bio: 'Science fiction author' },
    { name: 'John Doe', bio: 'Technical writer' },
    { name: 'Sarah Wilson', bio: 'Romance novelist from Paris' },
  ];

  it('GET - retrieves all authors when database has entries', async () => {
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

  it('GET - returns multiple authors in correct order', async () => {
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

  it('GET - returns empty array when no authors exist', async () => {
    const { data } = await api.get(endpoint);
    expect(data).toEqual([]);
  });

  it('GET - returns 400 for invalid ID format', async () => {
    try {
      await api.get(`${endpoint}/invalid`);
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('type', 'Params');
    }
  });

  it('GET - returns 404 for non-existent ID', async () => {
    try {
      await api.get(`${endpoint}/999999`);
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });

  it('GET - filters authors by name query parameter', async () => {
    await db.insert(authors).values(testAuthors);
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

  it('GET - filters authors by bio query parameter', async () => {
    await db.insert(authors).values(testAuthors);
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

  it('GET - filters authors by multiple query parameters', async () => {
    await db.insert(authors).values(testAuthors);
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

  it('GET - returns empty array for non-matching search', async () => {
    await db.insert(authors).values(testAuthors);
    const { data } = await api.get(endpoint, {
      params: { name: 'NonExistent' },
    });
    expect(data).toHaveLength(0);
  });

  it('GET - handles partial name matches', async () => {
    await db.insert(authors).values(testAuthors);
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

  it('GET - returns all authors when query parameter is invalid', async () => {
    await db.insert(authors).values(testAuthors);
    const { data } = await api.get(endpoint, {
      params: { unknown: 'value' },
    });
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(testAuthors.length);
  });

  it('POST - successfully creates new author with complete data', async () => {
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

  it('POST - handles empty bio field by setting it to null', async () => {
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

  it('POST - handles special characters in name and bio', async () => {
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
      expect(response.data).toHaveProperty('type', 'Body');
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

  it('POST - returns error for missing name field', async () => {
    await testInvalidCases({ bio: 'Missing name field' });
  });

  it('POST - rejects empty name field', async () => {
    await testInvalidCases({ name: '', bio: 'Some bio' });
  });

  it('POST - rejects requests with missing required fields', async () => {
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
