import { pgTable, text, integer, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { authUsers } from "@/db/shadow/auth";
import { clientActivityPeriods } from "../clients/client-activity-periods";

export const coachPayments = pgTable("coach_payments", {
  id: id(),
  coachId: text("coach_id").references(() => authUsers.id),
  amount: integer("amount").notNull(),
  client_activity_period_id: uuid("client_activity_period_id").references(() => clientActivityPeriods.id),
  ...timestamps,
});