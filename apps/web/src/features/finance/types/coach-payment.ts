import type { Tables } from "@/utils/supabase/database.types";
import { z } from "zod";

// Database types
export type CoachPayment = Tables<"coach_payments">;
export type CoachPaymentWithRelations = CoachPayment & {
	coach: Tables<"team_members"> | null;
	activity_periods: Array<Tables<"client_activity_period">>;
};

// Validation utilities
export const coachPaymentValidationUtils = {
	// UUID validation for IDs
	coachId: z.string().uuid("Invalid coach ID").min(1, "Coach is required"),
	
	// Amount validation - must be positive
	amount: z.number()
		.positive("Amount must be positive")
		.min(0.01, "Amount must be at least $0.01")
		.max(999999.99, "Amount cannot exceed $999,999.99"),
	
	// Status enum matching database enum
	status: z.enum(["Paid", "Not Paid"], {
		errorMap: () => ({ message: "Status must be either 'Paid' or 'Not Paid'" })
	}),
	
	// Date validation in YYYY-MM-DD format
	date: z.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
		.refine((date) => {
			const d = new Date(date);
			return !isNaN(d.getTime());
		}, "Invalid date"),
	
	// Optional activity periods for creation
	activityPeriodIds: z.array(z.string().uuid()).optional(),
};

// Create schema - strict validation for server
export const coachPaymentCreateSchema = z.object({
	coach_id: coachPaymentValidationUtils.coachId,
	amount: coachPaymentValidationUtils.amount,
	status: coachPaymentValidationUtils.status,
	date: coachPaymentValidationUtils.date,
	activity_period_ids: coachPaymentValidationUtils.activityPeriodIds,
});

// Update schema - with optional fields and ID required
export const coachPaymentUpdateSchema = z.object({
	id: z.string().uuid("Invalid coach payment ID"),
	coach_id: coachPaymentValidationUtils.coachId.optional(),
	amount: coachPaymentValidationUtils.amount.optional(),
	status: coachPaymentValidationUtils.status.optional(),
	date: coachPaymentValidationUtils.date.optional(),
});

// Form schema - form-friendly with defaults
export const coachPaymentFormSchema = z.object({
	coach_id: z.string().min(1, "Coach is required"),
	amount: z.number().positive("Amount must be positive"),
	status: z.enum(["Paid", "Not Paid"]).default("Not Paid"),
	date: z.string(),
	activity_period_ids: z.array(z.string()).optional().default([]),
});

// Edit form schema - extending form schema with ID
export const coachPaymentEditFormSchema = coachPaymentFormSchema.extend({
	id: z.string(),
});

// TypeScript types
export type CoachPaymentCreateInput = z.infer<typeof coachPaymentCreateSchema>;
export type CoachPaymentUpdateInput = z.infer<typeof coachPaymentUpdateSchema>;
export type CoachPaymentFormInput = z.infer<typeof coachPaymentFormSchema>;
export type CoachPaymentEditFormInput = z.infer<typeof coachPaymentEditFormSchema>;

// Status constants for dropdowns
export const COACH_PAYMENT_STATUS_OPTIONS = [
	{ value: "Paid", label: "Paid" },
	{ value: "Not Paid", label: "Not Paid" },
] as const;

// Validation helper functions
export const validateSingleField = (
	fieldName: keyof typeof coachPaymentValidationUtils,
	value: any
) => {
	try {
		coachPaymentValidationUtils[fieldName].parse(value);
		return { success: true, error: null };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { success: false, error: error.errors[0].message };
		}
		return { success: false, error: "Validation failed" };
	}
};

export const getAllValidationErrors = (error: any): string[] => {
	const errors: string[] = [];
	
	if (error?.validationErrors) {
		if (error.validationErrors._errors) {
			errors.push(...error.validationErrors._errors);
		}
		
		Object.entries(error.validationErrors).forEach(([field, fieldErrors]) => {
			if (field !== "_errors" && fieldErrors) {
				if (Array.isArray(fieldErrors)) {
					errors.push(...fieldErrors);
				} else if (
					fieldErrors &&
					typeof fieldErrors === "object" &&
					"_errors" in fieldErrors &&
					Array.isArray(fieldErrors._errors)
				) {
					errors.push(...fieldErrors._errors);
				}
			}
		});
	}
	
	return errors;
};
