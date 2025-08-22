import { pgTable, text, boolean, date, pgEnum } from "drizzle-orm/pg-core";
import { id, timestamps } from "../common";

export const clientOverallStatusEnum = pgEnum("client_overall_status", [
  "new",
  "live",
  "paused",
  "churned",
]);

export const everfitAccessEnum = pgEnum("everfit_access", [
  "new",
  "requested",
  "confirmed",
]);

export const clients = pgTable("clients", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  vipTermsSigned: boolean("vip_terms_signed").notNull().default(false),
  everfitAccess: everfitAccessEnum("everfit_access").default("new"),
  onboardingCallCompleted: boolean("onboarding_call_completed")
    .notNull()
    .default(false),
  twoWeekCheckInCallCompleted: boolean("two_week_check_in_call_completed")
    .notNull()
    .default(false),
  onboardingNotes: text("onboarding_notes"),
  overallStatus: clientOverallStatusEnum("overall_status").default("new"),
  onboardingCompletedDate: date("onboarding_completed_date"),
  offboardDate: date("offboard_date"),
  teamIds: text("team_ids"),
  ...timestamps,
});
