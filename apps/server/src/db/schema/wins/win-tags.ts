import { pgTable, text } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";

export const winTags = pgTable("win_tags", {
  id: id(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  ...timestamps,
}); 