import {
  doublePrecision,
  integer,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const program_level = ["Undergraduate", "Graduate"] as const;
export const coop_cycle = [
  "Fall/Winter",
  "Winter/Spring",
  "Spring/Summer",
  "Summer/Fall",
] as const;
export const coop_year = ["1st", "2nd", "3rd"] as const;

export const openmario = pgSchema("openmario");

export const program_level_type = openmario.enum(
  "program_level",
  program_level,
);
export const coop_cycle_type = openmario.enum("coop_cycle", coop_cycle);
export const coop_year_type = openmario.enum("coop_year", coop_year);

export const company = openmario.table("company", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  owner_id: uuid().references(() => users.id, { onDelete: "set null" }),
});

export const position = openmario.table(
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

export const location = openmario.table(
  "location",
  {
    id: uuid().defaultRandom().primaryKey(),
    state_code: varchar({ length: 3 }).notNull(),
    state: varchar({ length: 100 }).notNull(),
    city: varchar({ length: 100 }).notNull(),
  },
  (table) => [unique().on(table.state_code, table.state, table.city)],
);

export const submission = openmario.table("submission", {
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

export const users = openmario.table("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 100 }).notNull(),
  email: text().notNull().unique(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const profile_major = openmario.table(
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

export const profile_minor = openmario.table(
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

export const major = openmario.table("major", {
  id: uuid().defaultRandom().primaryKey(),
  program_level: program_level_type().notNull(),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const minor = openmario.table("minor", {
  id: uuid().defaultRandom().primaryKey(),
  program_level: program_level_type().notNull(),
  name: varchar({ length: 255 }).notNull().unique(),
});
