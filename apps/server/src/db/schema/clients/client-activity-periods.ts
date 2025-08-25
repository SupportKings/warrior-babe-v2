import { pgTable, uuid, date, text, boolean } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { clients } from "./clients";
import { authUsers } from "@/db/shadow/auth";

export const clientActivityPeriods = pgTable("client_activity_period", {
  id: id(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  coachId: text('coach_id').references(() => authUsers.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  active: boolean('active').notNull().default(true),
  ...timestamps,
});
