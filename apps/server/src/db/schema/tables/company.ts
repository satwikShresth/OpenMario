import { pgTable, text, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const company = pgTable('company', {
   id: uuid().defaultRandom().primaryKey(),
   name: varchar({ length: 255 }).notNull().unique(),
   owner_id: text().references(() => user.id, { onDelete: 'set null' })
});

export const position = pgTable(
   'position',
   {
      id: uuid().defaultRandom().primaryKey(),
      company_id: uuid()
         .notNull()
         .references(() => company.id, { onDelete: 'restrict' }),
      name: varchar({ length: 255 }).notNull(),
      owner_id: text().references(() => user.id, { onDelete: 'set null' })
   },
   table => [unique().on(table.company_id, table.name)]
);

export const location = pgTable(
   'location',
   {
      id: uuid().defaultRandom().primaryKey(),
      state_code: varchar({ length: 3 }).notNull(),
      state: varchar({ length: 100 }).notNull(),
      city: varchar({ length: 100 }).notNull()
   },
   table => [unique().on(table.state_code, table.state, table.city)]
);
