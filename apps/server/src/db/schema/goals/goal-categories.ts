import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";

export const goalCategories = pgTable("goal_categories", {
  id: id(),
  name: text("name").notNull(),
  description: text("description"),
  is_active: boolean("is_active").notNull().default(true),
  ...timestamps,
});
  