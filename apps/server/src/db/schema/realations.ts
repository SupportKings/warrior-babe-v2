import { relations } from "drizzle-orm";
import { authUsers } from "../shadow/auth";
import { coachTeams } from "./coach/coach-teams";
import { teamMembers } from "./coach/team-members";
import { paymentPlanTemplateItems } from "./payments/payment-plan-template-items";
import { paymentPlanTemplates } from "./payments/payment-plan-templates";
import { paymentPlans } from "./payments/payment-plans";
import { paymentSlots } from "./payments/payment-slots";
import { payments } from "./payments/payments";

// Payment relations
export const paymentPlanRelations = relations(paymentPlans, ({ many }) => ({
	slots: many(paymentSlots),
}));

export const planTemplateRelations = relations(
	paymentPlanTemplates,
	({ many }) => ({
		items: many(paymentPlanTemplateItems),
	}),
);

// Coach relations
export const coachTeamsRelations = relations(coachTeams, ({ one, many }) => ({
	premierCoach: one(teamMembers, {
		fields: [coachTeams.premier_coach_id],
		references: [teamMembers.id],
		relationName: "premier_coach",
	}),
	coach: one(teamMembers, {
		fields: [coachTeams.coach_id],
		references: [teamMembers.id],
		relationName: "coach",
	}),
	teamMembers: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
	user: one(authUsers, {
		fields: [teamMembers.user_id],
		references: [authUsers.id],
	}),
	team: one(coachTeams, {
		fields: [teamMembers.team_id],
		references: [coachTeams.id],
	}),
}));
