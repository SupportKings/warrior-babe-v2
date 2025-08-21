import { z } from "zod";

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

	// Phone number validation (optional but validated when provided)
	phone: z
		.string()
		.optional()
		.transform((val) => val?.trim() || "")
		.refine(
			(val) => !val || /^[\d\s\-+().]{10,20}$/.test(val),
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
		.transform((val) => val?.trim() || "")
		.refine(
			(val) =>
				!val ||
				(/^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(new Date(val).getTime())),
			"Date must be in YYYY-MM-DD format or empty",
		),

	// URL validation
	url: z
		.string()
		.optional()
		.transform((val) => val?.trim() || "")
		.refine(
			(val) => !val || z.string().url().safeParse(val).success,
			"Must be a valid URL or empty",
		),

	// UUID validation
	uuid: z.string().uuid({ message: "Invalid ID format" }),

	// Text with length limits
	longText: z
		.string()
		.optional()
		.transform((val) => val?.trim() || "")
		.refine((val) => val.length <= 2000, "Must be less than 2000 characters"),

	// Status validation
	clientStatus: z.enum(
		["active", "paused", "churned", "onboarding", "pending"],
		{
			message: "Invalid client status",
		},
	),

	platformAccessStatus: z.enum(["pending", "granted", "revoked", "expired"], {
		message: "Invalid platform access status",
	}),
};

// Base client schema for creation
export const clientCreateSchema = z
	.object({
		first_name: validationUtils.name,
		last_name: validationUtils.name,
		email: validationUtils.email,
		phone: validationUtils.phone,
		start_date: validationUtils.dateString,
		end_date: validationUtils.optionalDateString,
		renewal_date: validationUtils.optionalDateString,
		product_id: z
			.string()
			.uuid({ message: "Invalid product ID" })
			.optional()
			.or(z.literal("")),
		created_by: z.string().uuid({ message: "Invalid user ID" }).optional(),
		status: validationUtils.clientStatus.optional().default("active"),
		platform_access_status: validationUtils.platformAccessStatus
			.optional()
			.default("pending"),
		platform_link: validationUtils.url,
		consultation_form_completed: z.boolean().optional().default(false),
		vip_terms_signed: z.boolean().optional().default(false),
		onboarding_notes: validationUtils.longText,
	})
	.refine(
		(data) => {
			// If end_date is provided, it must be after start_date
			if (data.end_date && data.start_date) {
				return new Date(data.end_date) > new Date(data.start_date);
			}
			return true;
		},
		{
			message: "End date must be after start date",
			path: ["end_date"],
		},
	)
	.refine(
		(data) => {
			// If renewal_date is provided, it must be after start_date
			if (data.renewal_date && data.start_date) {
				return new Date(data.renewal_date) > new Date(data.start_date);
			}
			return true;
		},
		{
			message: "Renewal date must be after start date",
			path: ["renewal_date"],
		},
	);

// Schema for client updates (all fields optional except id)
export const clientUpdateSchema = z
	.object({
		id: validationUtils.uuid,
		first_name: validationUtils.name.optional(),
		last_name: validationUtils.name.optional(),
		email: validationUtils.email.optional(),
		phone: validationUtils.phone,
		start_date: validationUtils.dateString.optional(),
		end_date: validationUtils.optionalDateString,
		renewal_date: validationUtils.optionalDateString,
		product_id: z
			.string()
			.uuid({ message: "Invalid product ID" })
			.optional()
			.or(z.literal("")),
		status: validationUtils.clientStatus.optional(),
		platform_access_status: validationUtils.platformAccessStatus.optional(),
		platform_link: validationUtils.url,
		consultation_form_completed: z.boolean().optional(),
		vip_terms_signed: z.boolean().optional(),
		onboarding_notes: validationUtils.longText,
		churned_at: validationUtils.optionalDateString,
		paused_at: validationUtils.optionalDateString,
		offboard_date: validationUtils.optionalDateString,
	})
	.refine(
		(data) => {
			// If end_date is provided and start_date exists, end_date must be after start_date
			if (data.end_date && data.start_date) {
				return new Date(data.end_date) > new Date(data.start_date);
			}
			return true;
		},
		{
			message: "End date must be after start date",
			path: ["end_date"],
		},
	)
	.refine(
		(data) => {
			// If renewal_date is provided and start_date exists, renewal_date must be after start_date
			if (data.renewal_date && data.start_date) {
				return new Date(data.renewal_date) > new Date(data.start_date);
			}
			return true;
		},
		{
			message: "Renewal date must be after start date",
			path: ["renewal_date"],
		},
	);

// Form schema for client creation (used in forms) - more lenient for better UX
export const clientFormSchema = z
	.object({
		first_name: validationUtils.name,
		last_name: validationUtils.name,
		email: validationUtils.email,
		phone: z.string().optional().default(""),
		start_date: validationUtils.dateString,
		end_date: z.string().optional().default(""),
		renewal_date: z.string().optional().default(""),
		product_id: z.string().optional().default(""),
		status: validationUtils.clientStatus.optional().default("active"),
		platform_access_status: validationUtils.platformAccessStatus.optional().default("pending"),
		platform_link: z.string().optional().default(""),
		consultation_form_completed: z.boolean().optional().default(false),
		vip_terms_signed: z.boolean().optional().default(false),
		onboarding_notes: z.string().optional().default(""),
	})
	.refine(
		(data) => {
			// Form-level validation for dates
			if (data.end_date && data.start_date) {
				const startDate = new Date(data.start_date);
				const endDate = new Date(data.end_date);
				return endDate > startDate;
			}
			return true;
		},
		{
			message: "End date must be after start date",
			path: ["end_date"],
		},
	);

// Form schema for client updates
export const clientEditFormSchema = clientFormSchema.extend({
	id: validationUtils.uuid,
	churned_at: z.string().optional().default(""),
	paused_at: z.string().optional().default(""),
	offboard_date: z.string().optional().default(""),
});

// Type exports for TypeScript
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type ClientFormInput = z.infer<typeof clientFormSchema>;
export type ClientEditFormInput = z.infer<typeof clientEditFormSchema>;

// Common client status options
export const CLIENT_STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "churned", label: "Churned" },
	{ value: "onboarding", label: "Onboarding" },
	{ value: "pending", label: "Pending" },
] as const;

// Platform access status options
export const PLATFORM_ACCESS_STATUS_OPTIONS = [
	{ value: "pending", label: "Pending" },
	{ value: "granted", label: "Granted" },
	{ value: "revoked", label: "Revoked" },
	{ value: "expired", label: "Expired" },
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
		first_name: validationUtils.name,
		last_name: validationUtils.name,
		email: validationUtils.email,
		phone: validationUtils.phone,
		start_date: validationUtils.dateString,
		end_date: validationUtils.optionalDateString,
		renewal_date: validationUtils.optionalDateString,
		platform_link: validationUtils.url,
		onboarding_notes: validationUtils.longText,
		status: validationUtils.clientStatus,
		platform_access_status: validationUtils.platformAccessStatus,
	};

	return (value: any) => validateSingleField(value, fieldSchemas[fieldName]);
};

// Client status validation helpers
export const isValidClientStatus = (
	status: string,
): status is ClientFormInput["status"] => {
	return CLIENT_STATUS_OPTIONS.some((option) => option.value === status);
};

export const isValidPlatformStatus = (
	status: string,
): status is ClientFormInput["platform_access_status"] => {
	return PLATFORM_ACCESS_STATUS_OPTIONS.some(
		(option) => option.value === status,
	);
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
				const fieldName = field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
				errors.push(...fieldErrors.map((error: string) => `${fieldName}: ${error}`));
			} else if (fieldErrors._errors && Array.isArray(fieldErrors._errors)) {
				const fieldName = field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
				errors.push(...fieldErrors._errors.map((error: string) => `${fieldName}: ${error}`));
			}
		}
	});

	return errors;
};
