import { relations } from "drizzle-orm";

import { paymentPlans } from "./payments/payment-plans";
import { paymentSlots } from "./payments/payment-slots";
import { payments } from "./payments/payments";
import { paymentPlanTemplates } from "./payments/payment-plan-templates";
import { paymentPlanTemplateItems } from "./payments/payment-plan-template-items";

export const paymentPlanRelations = relations(paymentPlans, ({ many }) => ({
  slots: many(paymentSlots),
}));

export const planTemplateRelations = relations(paymentPlanTemplates, ({ many }) => ({
  items: many(paymentPlanTemplateItems),
}));
