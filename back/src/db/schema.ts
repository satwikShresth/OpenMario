import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const VALID_GENRES: string[] = [
   'Fiction',
   'Non-Fiction',
   'Mystery',
   'Science Fiction',
   'Fantasy',
   'Romance',
   'Thriller',
   'Horror',
   'Biography',
   'History',
   'Science',
   'Poetry',
   'Drama',
   'Children',
] as const;

export const revoked = sqliteTable('revoked', {
   id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
   signature: text().notNull(),
});

export const authors = sqliteTable('authors', {
   id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
   user_id: integer({ mode: 'number' })
      .references(() => users.id)
      .notNull(),
   name: text().notNull().unique(),
   bio: text(),
});

export const users = sqliteTable('users', {
   id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
   username: text().notNull().unique(),
   password: text().notNull(),
});

export const books = sqliteTable('books', {
   id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
   user_id: integer({ mode: 'number' })
      .references(() => users.id)
      .notNull(),
   author_id: integer({ mode: 'number' })
      .references(() => authors.id)
      .notNull(),
   title: text().notNull(),
   pub_year: text({ length: 4 })
      .notNull(),
   genre: text()
      .notNull(),
}, (table) => [
   unique('unique_book_idx').on(
      table.author_id,
      table.genre,
      table.pub_year,
      table.title,
   ),
]);
