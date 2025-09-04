// Import database types for proper typing
import type { Enums, Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Database client type for better TypeScript support
export type Client = Tables<"clients">;
export type ClientWithRelations = Client & {
	product?: Tables<"products"> | null;
	client_assignments?: Array<
		Tables<"client_assignments"> & {
			coach?:
				| (Tables<"team_members"> & {
						user?: Tables<"user"> | null;
				  })
				| null;
		}
	>;
	client_goals?: Array<
		Tables<"client_goals"> & {
			goal_type?: Tables<"goal_types"> | null;
		}
	>;
	client_wins?: Array<
		Tables<"client_wins"> & {
			recorded_by_user?: Tables<"user"> | null;
		}
	>;
	client_testimonials?: Tables<"client_testimonials">[];
	client_nps?: Tables<"client_nps">[];
	client_activity_periods?: Array<
		Tables<"client_activity_period"> & {
			coach_name?: string;
			payment_plan?: string | null;
		}
	>;
	payment_plans?: Tables<"payment_plans">[];
};

// Validation utilities
export const validationUtils = {
	// Name validation with proper formatting
	name: z
		.string()
		.min(2, "Must be at least 2 characters")
		.max(50, "Must be less than 50 characters")
		.regex(
			/^[a-zA-Z\s'-]+$/,
			"Only letters, spaces, hyphens, and apostrophes allowed",
		)
		.transform((val) => val.trim())
		.refine((val) => val.length > 0, "Cannot be empty after trimming"),

	// Email with better validation
	email: z
		.string()
		.min(1, "Email is required")
		.email({ message: "Please enter a valid email address" })
		.max(100, "Email must be less than 100 characters")
		.toLowerCase()
		.transform((val) => val.trim()),

	// Phone number validation (required by database schema)
	phone: z
		.string()
		.min(1, "Phone number is required")
		.max(20, "Phone must be less than 20 characters")
		.refine(
			(val) => /^[\d\s\-+().]{10,20}$/.test(val),
			"Phone must be 10-20 characters with only digits, spaces, and common phone symbols",
		),

	// Date validation
	dateString: z
		.string()
		.min(1, "Date is required")
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
		.refine((date) => {
			const parsed = new Date(date);
			return !isNaN(parsed.getTime());
		}, "Invalid date"),

	// Optional date validation
	optionalDateString: z
		.string()
		.optional()
		.nullable()
		.transform((val) => (val === undefined ? undefined : val?.trim() || null))
		.refine(
			(val) =>
				val === undefined ||
				!val ||
				(/^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(new Date(val).getTime())),
			"Date must be in YYYY-MM-DD format or empty",
		),

	// UUID validation
	uuid: z.string().uuid({ message: "Invalid ID format" }),

	// Text with length limits
	longText: z
		.string()
		.optional()
		.nullable()
		.transform((val) => (val === undefined ? undefined : val?.trim() || null))
		.refine(
			(val) => val === undefined || !val || val.length <= 2000,
			"Must be less than 2000 characters",
		),

	// Client overall status validation (matches database enum)
	clientOverallStatus: z
		.enum(["new", "live", "paused", "churned"], {
			message: "Invalid client status",
		})
		.nullable()
		.optional(),

	// Everfit access status validation (matches database enum)
	everfitAccess: z
		.enum(["new", "requested", "confirmed"], {
			message: "Invalid everfit access status",
		})
		.nullable()
		.optional(),
};

// Base client schema for creation (matches database schema)
export const clientCreateSchema = z.object({
	name: validationUtils.name,
	email: validationUtils.email,
	phone: validationUtils.phone,
	overallStatus: validationUtils.clientOverallStatus,
	everfitAccess: validationUtils.everfitAccess,
	onboardingCallCompleted: z.boolean().optional().default(false),
	twoWeekCheckInCallCompleted: z.boolean().optional().default(false),
	vipTermsSigned: z.boolean().optional().default(false),
	onboardingNotes: validationUtils.longText,
	onboardingCompletedDate: validationUtils.optionalDateString,
	offboardDate: validationUtils.optionalDateString,
});

// Schema for client updates (all fields optional except id)
export const clientUpdateSchema = z.object({
	id: validationUtils.uuid,
	name: validationUtils.name.optional(),
	email: validationUtils.email.optional(),
	phone: validationUtils.phone.optional(),
	overallStatus: validationUtils.clientOverallStatus,
	everfitAccess: validationUtils.everfitAccess,
	onboardingCallCompleted: z.boolean().optional(),
	twoWeekCheckInCallCompleted: z.boolean().optional(),
	vipTermsSigned: z.boolean().optional(),
	onboardingNotes: validationUtils.longText,
	onboardingCompletedDate: validationUtils.optionalDateString,
	offboardDate: validationUtils.optionalDateString,
});

// Form schema for client creation (used in forms) - more lenient for better UX
export const clientFormSchema = z.object({
	name: validationUtils.name,
	email: validationUtils.email,
	phone: z.string().min(1, "Phone is required"),
	overall_status: z
		.enum(["new", "live", "paused", "churned"])
		.optional()
		.default("new"),
	everfit_access: z
		.enum(["new", "requested", "confirmed"])
		.optional()
		.default("new"),
	onboarding_call_completed: z.boolean().optional().default(false),
	two_week_check_in_call_completed: z.boolean().optional().default(false),
	vip_terms_signed: z.boolean().optional().default(false),
	onboarding_notes: z.string().optional().default(""),
	onboarding_completed_date: z.string().optional().default(""),
	offboard_date: z.string().optional().default(""),
});

// Form schema for client updates
export const clientEditFormSchema = clientFormSchema.extend({
	id: validationUtils.uuid,
	offboard_date: z.string().optional().default(""),
});

// Type exports for TypeScript
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type ClientFormInput = z.infer<typeof clientFormSchema>;
export type ClientEditFormInput = z.infer<typeof clientEditFormSchema>;

// Client overall status options (matches database enum)
export const CLIENT_OVERALL_STATUS_OPTIONS = [
	{ value: "new", label: "New" },
	{ value: "live", label: "Live" },
	{ value: "paused", label: "Paused" },
	{ value: "churned", label: "Churned" },
] as const;

// Everfit access status options (matches database enum)
export const EVERFIT_ACCESS_OPTIONS = [
	{ value: "new", label: "New" },
	{ value: "requested", label: "Requested" },
	{ value: "confirmed", label: "Confirmed" },
] as const;

// Validation helper functions for forms
export const validateSingleField = <T>(
	value: T,
	schema: z.ZodSchema<T>,
): string | undefined => {
	try {
		schema.parse(value);
		return undefined;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.issues[0]?.message || "Invalid input";
		}
		return "Invalid input";
	}
};

// Get field validation function for specific field
export const getFieldValidator = (fieldName: keyof ClientFormInput) => {
	const fieldSchemas: Record<string, z.ZodSchema> = {
		name: validationUtils.name,
		email: validationUtils.email,
		phone: validationUtils.phone,
		onboarding_notes: validationUtils.longText,
		overall_status: validationUtils.clientOverallStatus,
		everfit_access: validationUtils.everfitAccess,
	};

	return (value: any) => validateSingleField(value, fieldSchemas[fieldName]);
};

// Client status validation helpers
export const isValidClientOverallStatus = (
	status: string,
): status is ClientFormInput["overall_status"] => {
	return CLIENT_OVERALL_STATUS_OPTIONS.some(
		(option) => option.value === status,
	);
};

export const isValidEverfitAccess = (
	status: string,
): status is ClientFormInput["everfit_access"] => {
	return EVERFIT_ACCESS_OPTIONS.some((option) => option.value === status);
};

// Type guards for better TypeScript support
export const isClientCreateInput = (
	data: unknown,
): data is ClientCreateInput => {
	return clientCreateSchema.safeParse(data).success;
};

export const isClientUpdateInput = (
	data: unknown,
): data is ClientUpdateInput => {
	return clientUpdateSchema.safeParse(data).success;
};

export const isClientFormInput = (data: unknown): data is ClientFormInput => {
	return clientFormSchema.safeParse(data).success;
};

// Date validation helpers
export const validateDateRange = (
	startDate: string,
	endDate: string,
): boolean => {
	if (!startDate || !endDate) return true;
	return new Date(endDate) > new Date(startDate);
};

// Custom error formatter for better UX
export const formatValidationError = (
	error: z.ZodError,
): Record<string, string[]> => {
	const errors: Record<string, string[]> = {};

	error.issues.forEach((issue) => {
		const field = issue.path.join(".");
		if (!errors[field]) {
			errors[field] = [];
		}
		errors[field].push(issue.message);
	});

	return errors;
};

// Extract all validation errors for toast display
export const getAllValidationErrors = (
	validationErrors: Record<string, any>,
): string[] => {
	const errors: string[] = [];

	// Handle global errors
	if (validationErrors._errors && Array.isArray(validationErrors._errors)) {
		errors.push(...validationErrors._errors);
	}

	// Handle field-specific errors
	Object.entries(validationErrors).forEach(([field, fieldErrors]) => {
		if (field !== "_errors" && fieldErrors) {
			if (Array.isArray(fieldErrors)) {
				const fieldName = field
					.replace(/_/g, " ")
					.replace(/\b\w/g, (l) => l.toUpperCase());
				errors.push(
					...fieldErrors.map((error: string) => `${fieldName}: ${error}`),
				);
			} else if (fieldErrors._errors && Array.isArray(fieldErrors._errors)) {
				const fieldName = field
					.replace(/_/g, " ")
					.replace(/\b\w/g, (l) => l.toUpperCase());
				errors.push(
					...fieldErrors._errors.map(
						(error: string) => `${fieldName}: ${error}`,
					),
				);
			}
		}
	});

	return errors;
};
