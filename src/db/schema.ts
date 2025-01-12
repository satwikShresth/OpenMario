import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const authors = sqliteTable('authors', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    bio: text('bio'),
});

export const books = sqliteTable('books', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    author_id: integer('author_id', { mode: 'number' }).references(() => authors.id),
    title: text('title'),
    pub_year: text('pub_year'),
    genre: text('genre'),
});
