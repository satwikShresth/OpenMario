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

export const authors = sqliteTable('authors', {
   id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
   name: text('name').notNull().unique(),
   bio: text('bio'),
});

export const books = sqliteTable('books', {
   id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
   author_id: integer('author_id', { mode: 'number' })
      .references(() => authors.id)
      .notNull(),
   title: text('title').notNull(),
   pub_year: text('pub_year', { length: 4 })
      .notNull(),
   genre: text('genre')
      .notNull(),
}, (table) => ({
   unique_book_idx: unique('unique_book_idx').on(
      table.author_id,
      table.genre,
      table.pub_year,
      table.title,
   ),
}));
