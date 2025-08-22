import {
  pgTable,
  text,
  integer,
  uuid,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { paymentPlans } from "./payment-plans";
import { payments } from "./payments";

export const paymentSlots = pgTable("payment_slots", {
  id: id(),
  payment_plan_id: uuid("plan_id").references(() => paymentPlans.id),
  payment_id: uuid("payment_id").references(() => payments.id),
  due_date: date("due_date").notNull(),
  amount_due: integer("amount_due").notNull(),
  notes: text("notes"),
  amount_paid: integer("amount_paid").notNull().default(0),
  ...timestamps,
});
