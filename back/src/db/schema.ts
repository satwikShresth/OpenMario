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
});

export const position = pgTable(
  "position",
  {
    id: uuid().defaultRandom().primaryKey(),
    company_id: uuid()
      .notNull()
      .references(() => company.id, { onDelete: "restrict" }),
    name: varchar({ length: 255 }).notNull(),
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
  owner_id: text().references(() => users.id, { onDelete: "restrict" }),
  created_at: timestamp().notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const jwkss = pgTable("jwkss", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const profile_major = pgTable(
  "profile_major",
  {
    user_id: text()
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
    user_id: text()
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
