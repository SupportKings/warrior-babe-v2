import { pgTable, text, integer, date, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { clients } from "./clients";
import { authUsers } from "@/db/shadow/auth";

export const clientNps = pgTable("client_nps", {
  id: id(),
  nps_score: integer("nps_score").notNull(),
  recorded_date: date("recorded_date").notNull(),
  recorded_by: text("recorded_by").references(() => authUsers.id),
  notes: text("notes"),
  provided_by: uuid("provided_by").references(() => clients.id),
  ...timestamps,
});
