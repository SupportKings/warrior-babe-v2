import { pgTable, text, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { goalCategories } from "./goal-categories";

export const goalTypes = pgTable("goal_types", {
  id: id(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  category: text("category"),
  default_duration_days: integer("default_duration_days").notNull(),
  is_measurable: boolean("is_measurable").notNull().default(true),
  unit_of_measures: text("unit_of_measures"),
  is_active: boolean("is_active").notNull().default(true),
  category_id: uuid("category_id").references(() => goalCategories.id),
  ...timestamps,
});
  