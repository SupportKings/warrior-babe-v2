import { pgTable, integer, uuid } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";
import { paymentPlanTemplates } from "./payment-plan-templates";

export const paymentPlanTemplateItems = pgTable("payment_plan_template_items", {
  id: id(),
  paymentPlanTemplateId: uuid("payment_plan_template_id").references(
    () => paymentPlanTemplates.id
  ),
  amount_due: integer("amount_due").notNull(),
  months_to_delay: integer("months_to_delay").notNull().default(0),
  ...timestamps,
});
