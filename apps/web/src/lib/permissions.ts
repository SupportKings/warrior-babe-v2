import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

//ALL OPTIONS
export const statement = {
	...defaultStatements,

	//user management
	user: [
		"create",
		"list",
		"set-role",
		"ban",
		"impersonate",
		"delete",
		"set-password",
		"update",
	],

	// Client Management
	clients: [
		"read",
		"write",
		"activation_checklist_read",
		"activation_checklist_write",
		"nps_read",
		"nps_write",
		"wins_read",
		"wins_write",
		"testimonials_read",
		"testimonials_write",
		"status_read",
		"status_write",
		"onboarding_read",
		"onboarding_write",
		"offboarding_read",
		"offboarding_write",
		"assignments_read",
		"assignments_write",
		"history_read",
		"call_feedback_read",
		"plan_dates_write",
	],

	// Coach Management
	coaches: [
		"read",
		"write",
		"onboarding_read",
		"onboarding_write",
		"capacity_read",
		"capacity_write",
		"assignments_read",
		"assignments_write",
		"kpis_read",
		"status_write",
	],

	// Ticket Management
	tickets: [
		"read",
		"write",
		"create",
		"reassign",
		"executive_read",
		"reminders_write",
	],

	// Billing Management
	billing: [
		"read",
		"write",
		"transactions_read",
		"payment_plans_read",
		"payment_plans_write",
		"cash_collection_read",
		"renewals_read",
		"churn_read",
		"coach_costs_read",
		"coach_costs_write",
		"amount_owed_read",
		"terms_write",
	],

	// Analytics & Reporting
	analytics: [
		"read",
		"forecasting_read",
		"cohort_read",
		"win_tags_read",
		"activity_read",
	],

	// System Configuration
	system: ["configure", "churn_rate_configure", "activation_dropoff_configure"],
} as const;

export const ac = createAccessControl(statement);

// User role - full permissions
export const user = ac.newRole({
	clients: [
		"read",
		"write",
		"activation_checklist_read",
		"activation_checklist_write",
		"nps_read",
		"nps_write",
		"wins_read",
		"wins_write",
		"testimonials_read",
		"testimonials_write",
		"status_read",
		"status_write",
		"onboarding_read",
		"onboarding_write",
		"offboarding_read",
		"offboarding_write",
		"assignments_read",
		"assignments_write",
		"history_read",
		"call_feedback_read",
		"plan_dates_write",
	],
	coaches: [
		"read",
		"write",
		"onboarding_read",
		"onboarding_write",
		"capacity_read",
		"capacity_write",
		"assignments_read",
		"assignments_write",
		"kpis_read",
		"status_write",
	],
	tickets: [
		"read",
		"write",
		"create",
		"reassign",
		"executive_read",
		"reminders_write",
	],
	billing: [
		"read",
		"write",
		"transactions_read",
		"payment_plans_read",
		"payment_plans_write",
		"cash_collection_read",
		"renewals_read",
		"churn_read",
		"coach_costs_read",
		"coach_costs_write",
		"amount_owed_read",
		"terms_write",
	],
	analytics: [
		"read",
		"forecasting_read",
		"cohort_read",
		"win_tags_read",
		"activity_read",
	],
	system: ["configure", "churn_rate_configure", "activation_dropoff_configure"],
	user: [
		"create",
		"list",
		"set-role",
		"ban",
		"impersonate",
		"delete",
		"set-password",
		"update",
	],
});

// Admin role - full permissions
export const admin = ac.newRole({
	clients: [
		"read",
		"write",
		"activation_checklist_read",
		"activation_checklist_write",
		"nps_read",
		"nps_write",
		"wins_read",
		"wins_write",
		"testimonials_read",
		"testimonials_write",
		"status_read",
		"status_write",
		"onboarding_read",
		"onboarding_write",
		"offboarding_read",
		"offboarding_write",
		"assignments_read",
		"assignments_write",
		"history_read",
		"call_feedback_read",
		"plan_dates_write",
	],
	coaches: [
		"read",
		"write",
		"onboarding_read",
		"onboarding_write",
		"capacity_read",
		"capacity_write",
		"assignments_read",
		"assignments_write",
		"kpis_read",
		"status_write",
	],
	tickets: [
		"read",
		"write",
		"create",
		"reassign",
		"executive_read",
		"reminders_write",
	],
	billing: [
		"read",
		"write",
		"transactions_read",
		"payment_plans_read",
		"payment_plans_write",
		"cash_collection_read",
		"renewals_read",
		"churn_read",
		"coach_costs_read",
		"coach_costs_write",
		"amount_owed_read",
		"terms_write",
	],
	analytics: [
		"read",
		"forecasting_read",
		"cohort_read",
		"win_tags_read",
		"activity_read",
	],
	system: ["configure", "churn_rate_configure", "activation_dropoff_configure"],
	...adminAc.statements,
});

export const rolesMap = {
	user,
	admin,
} as const;

//FOR DEV

// Map of role keys to their display names
export const roleDisplayNames = {
	user: "User",
	admin: "Administrator",
} as const;

// Type-safe permissions type inferred from role statements
export type PermissionStatements = typeof admin.statements;

// All possible permission values (extracted from the statement object)
type PermissionValues =
	| "create"
	| "list"
	| "set-role"
	| "ban"
	| "impersonate"
	| "delete"
	| "set-password"
	| "update"
	| "revoke"
	| "read"
	| "write"
	| "activation_checklist_read"
	| "activation_checklist_write"
	| "nps_read"
	| "nps_write"
	| "wins_read"
	| "wins_write"
	| "testimonials_read"
	| "testimonials_write"
	| "status_read"
	| "status_write"
	| "onboarding_read"
	| "onboarding_write"
	| "offboarding_read"
	| "offboarding_write"
	| "assignments_read"
	| "assignments_write"
	| "history_read"
	| "call_feedback_read"
	| "plan_dates_write"
	| "capacity_read"
	| "capacity_write"
	| "kpis_read"
	| "reassign"
	| "executive_read"
	| "reminders_write"
	| "transactions_read"
	| "payment_plans_read"
	| "payment_plans_write"
	| "cash_collection_read"
	| "renewals_read"
	| "churn_read"
	| "coach_costs_read"
	| "coach_costs_write"
	| "amount_owed_read"
	| "terms_write"
	| "forecasting_read"
	| "cohort_read"
	| "win_tags_read"
	| "activity_read"
	| "configure"
	| "churn_rate_configure"
	| "activation_dropoff_configure";

// Type for statements from any role in the system (type-safe)
export type AnyRoleStatements =
	| {
			user?: readonly PermissionValues[];
			session?: readonly PermissionValues[];
			clients?: readonly PermissionValues[];
			coaches?: readonly PermissionValues[];
			tickets?: readonly PermissionValues[];
			billing?: readonly PermissionValues[];
			analytics?: readonly PermissionValues[];
			system?: readonly PermissionValues[];
	  }
	| readonly PermissionValues[]
	| Record<string, never>;
