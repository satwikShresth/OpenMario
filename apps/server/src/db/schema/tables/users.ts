import { pgTable, primaryKey, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { program_level_type } from './enums';

export const users = pgTable('users', {
   id: uuid().primaryKey().defaultRandom(),
   username: varchar({ length: 100 }).notNull(),
   email: text().notNull().unique(),
   created_at: timestamp().notNull().defaultNow(),
   updated_at: timestamp().notNull().defaultNow()
});

export const major = pgTable('major', {
   id: uuid().defaultRandom().primaryKey(),
   program_level: program_level_type().notNull(),
   name: varchar({ length: 255 }).notNull().unique()
});

export const minor = pgTable('minor', {
   id: uuid().defaultRandom().primaryKey(),
   program_level: program_level_type().notNull(),
   name: varchar({ length: 255 }).notNull().unique()
});

export const profile_major = pgTable(
   'profile_major',
   {
      user_id: uuid()
         .notNull()
         .references(() => users.id, { onDelete: 'cascade' }),
      major_id: uuid()
         .notNull()
         .references(() => major.id, { onDelete: 'cascade' })
   },
   table => [primaryKey({ columns: [table.user_id, table.major_id] })]
);

export const profile_minor = pgTable(
   'profile_minor',
   {
      user_id: uuid()
         .notNull()
         .references(() => users.id, { onDelete: 'cascade' }),
      minor_id: uuid()
         .notNull()
         .references(() => minor.id, { onDelete: 'cascade' })
   },
   table => [primaryKey({ columns: [table.user_id, table.minor_id] })]
);
