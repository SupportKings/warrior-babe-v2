import {
  pgTable,
  text,
  integer,
  uuid,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { clients } from "../clients/clients";
import { products } from "../products/products";

export const paymentPlanTypeEnum = pgEnum("payment_plan_frequency", [
  "PIF",
  "2-Pay",
  "Split Pay",
  "4-Pay",
  "CUSTOM",
]);
export const paymentPlans = pgTable("payment_plans", {
  id: id(),
  type: paymentPlanTypeEnum("type"),
  name: text("name").notNull(),
  clientId: uuid("client_id").references(() => clients.id),
  term_start_date: date("term_start_date").notNull(),
  term_end_date: date("term_end_date").notNull(),
  product_id: uuid("product_id").references(() => products.id),
  total_amount: integer("total_amount").default(0),
  total_amount_paid: integer("total_amount_paid").default(0),
  notes: text("notes"),
  subscription_id: text("subscription_id"),
  platform: text("platform"),
  ...timestamps,
});
