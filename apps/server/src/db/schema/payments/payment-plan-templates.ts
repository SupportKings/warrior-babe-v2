import {
  pgTable,
  text,
  integer,
  uuid,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { paymentPlanTypeEnum } from "./payment-plans";
import { products } from "../products/products";

export const paymentPlanTemplates = pgTable("payment_plan_templates", {
  id: id(),
  name: paymentPlanTypeEnum("name").notNull(),
  product_id: uuid("product_id").references(() => products.id),
  default_total_amount_owed: integer("default_total_amount_owed").notNull(),
  ...timestamps,
});
