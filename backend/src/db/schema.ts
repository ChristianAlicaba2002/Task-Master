import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  integer,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const priorityLevelEnum = pgEnum("priority_level", [
  "Low",
  "Medium",
  "High",
]);

export const statusEnum = pgEnum("status", ["To-Do", "In Progress", "Done"]);

// Users table
export const users = pgTable("users", {
  id: varchar({ length: 12 })
    .primaryKey()
    .$default(() => nanoid(12)),
  uId: varchar("uId", { length: 255 }).unique().notNull(),
  token: varchar("token"),
  first_name: varchar("first_name", { length: 255 }),
  last_name: varchar("last_name", { length: 255 }),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`NOW()`),
});

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar({ length: 12 })
    .primaryKey()
    .$default(() => nanoid(12)),
  user_id: varchar("user_id")
    .notNull()
    .references(() => users.uId, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority_level: priorityLevelEnum("priority_level").notNull(),
  status: statusEnum("status").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`NOW()`),
});

export const taskSelectSchema = createSelectSchema(tasks);
export const taskInsertSchema = createInsertSchema(tasks);
