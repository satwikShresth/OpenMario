import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  unique,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";

export const program_level = ["Undergraduate", "Graduate"] as const;
export const coop_cycle = [
  "Fall/Winter",
  "Winter/Spring",
  "Spring/Summer",
  "Summer/Fall",
] as const;
export const coop_year = ["1st", "2nd", "3rd"] as const;

export const program_level_type = pgEnum("program_level", program_level);
export const coop_cycle_type = pgEnum("coop_cycle", coop_cycle);
export const coop_year_type = pgEnum("coop_year", coop_year);

export const company = pgTable("company", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  owner_id: uuid().references(() => users.id, { onDelete: "set null" }),
});

export const position = pgTable(
  "position",
  {
    id: uuid().defaultRandom().primaryKey(),
    company_id: uuid()
      .notNull()
      .references(() => company.id, { onDelete: "restrict" }),
    name: varchar({ length: 255 }).notNull(),
    owner_id: uuid().references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [unique().on(table.company_id, table.name)],
);

export const location = pgTable(
  "location",
  {
    id: uuid().defaultRandom().primaryKey(),
    state_code: varchar({ length: 3 }).notNull(),
    state: varchar({ length: 100 }).notNull(),
    city: varchar({ length: 100 }).notNull(),
  },
  (table) => [unique().on(table.state_code, table.state, table.city)],
);

export const submission = pgTable("submission", {
  id: uuid().defaultRandom().primaryKey(),
  position_id: uuid()
    .notNull()
    .references(() => position.id, { onDelete: "restrict" }),
  location_id: uuid()
    .notNull()
    .references(() => location.id, { onDelete: "restrict" }),
  program_level: program_level_type().notNull(),
  work_hours: integer().notNull().default(40),
  coop_cycle: coop_cycle_type().notNull(),
  coop_year: coop_year_type().notNull(),
  year: integer().notNull(),
  compensation: doublePrecision(),
  other_compensation: varchar({ length: 255 }),
  details: varchar({ length: 255 }),
  owner_id: uuid().references(() => users.id, { onDelete: "set null" }),
  created_at: timestamp().notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 100 }).notNull(),
  email: text().notNull().unique(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const profile_major = pgTable(
  "profile_major",
  {
    user_id: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    major_id: uuid()
      .notNull()
      .references(() => major.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.user_id, table.major_id] })],
);

export const profile_minor = pgTable(
  "profile_minor",
  {
    user_id: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    minor_id: uuid()
      .notNull()
      .references(() => minor.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.user_id, table.minor_id] })],
);

export const major = pgTable("major", {
  id: uuid().defaultRandom().primaryKey(),
  program_level: program_level_type().notNull(),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const minor = pgTable("minor", {
  id: uuid().defaultRandom().primaryKey(),
  program_level: program_level_type().notNull(),
  name: varchar({ length: 255 }).notNull().unique(),
});
