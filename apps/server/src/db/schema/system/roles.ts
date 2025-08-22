import { pgTable, text, jsonb } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";

export const roles = pgTable("roles", {
  id: id(),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions"),
  ...timestamps,
});
