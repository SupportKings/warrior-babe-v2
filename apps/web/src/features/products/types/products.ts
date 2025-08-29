// Import database types for proper typing
import type { Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Database product type for better TypeScript support
export type Product = Tables<"products">;
export type ProductWithRelations = Product & {
	payment_plan_templates?: Tables<"payment_plan_templates">[];
	payment_plans?: Tables<"payment_plans">[];
};

// Payment Plan Template types
export type PaymentPlanTemplate = Tables<"payment_plan_templates">;
export type PaymentPlanTemplateSlot = Tables<"payment_plan_template_slots">;
export type PaymentPlanTemplateWithSlots = PaymentPlanTemplate & {
	payment_plan_template_slots?: PaymentPlanTemplateSlot[];
};

// Validation utilities
export const validationUtils = {
	// Name validation with proper formatting
	name: z
		.string()
		.min(2, "Must be at least 2 characters")
		.max(100, "Must be less than 100 characters")
		.transform((val) => val.trim())
		.refine((val) => val.length > 0, "Cannot be empty after trimming"),

	// Description validation
	description: z
		.string()
		.optional()
		.nullable()
		.transform((val) => val?.trim() || null)
		.refine(
			(val) => !val || val.length <= 1000,
			"Must be less than 1000 characters",
		),

	// Duration validation (in months) - base validator without default
	defaultDurationMonths: z
		.number()
		.int("Must be a whole number")
		.min(0, "Duration cannot be negative")
		.max(60, "Duration cannot exceed 60 months"),

	// Client unit validation - base validator without default
	clientUnit: z
		.number()
		.int("Must be a whole number")
		.min(0, "Client unit cannot be negative")
		.max(1000, "Client unit cannot exceed 1000"),

	// Active status validation
	isActive: z.boolean().optional().default(true),

	// UUID validation
	uuid: z.string().uuid("Invalid ID format"),

	// Payment Plan Template validations
	programLengthMonths: z
		.number()
		.int("Must be a whole number")
		.min(1, "Program length must be at least 1 month")
		.max(60, "Program length cannot exceed 60 months"),

	// Amount validation for payment plan templates
	amountDue: z
		.number()
		.min(0, "Amount due cannot be negative")
		.max(999999.99, "Amount due cannot exceed $999,999.99"),

	// Months to delay validation
	monthsToDelay: z
		.number()
		.int("Must be a whole number")
		.min(0, "Months to delay cannot be negative")
		.max(59, "Months to delay cannot exceed 59 months"),
};

// Base product schema for creation (matches database schema)
export const productCreateSchema = z.object({
	name: validationUtils.name,
	description: validationUtils.description,
	default_duration_months: validationUtils.defaultDurationMonths
		.nullable()
		.optional(),
	client_unit: validationUtils.clientUnit.nullable().optional(),
	is_active: validationUtils.isActive,
});

// Schema for product updates (all fields optional except id)
export const productUpdateSchema = z.object({
	id: validationUtils.uuid,
	name: validationUtils.name.optional(),
	description: validationUtils.description,
	default_duration_months: validationUtils.defaultDurationMonths
		.nullable()
		.optional(),
	client_unit: validationUtils.clientUnit.nullable().optional(),
	is_active: validationUtils.isActive,
});

// Form schema for product creation (used in forms) - more lenient for better UX
export const productFormSchema = z.object({
	name: validationUtils.name,
	description: z.string().optional().default(""),
	default_duration_months: z
		.string()
		.optional()
		.default("0")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			return isNaN(num) ? 0 : num;
		})
		.pipe(validationUtils.defaultDurationMonths),
	client_unit: z
		.string()
		.optional()
		.default("0")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			return isNaN(num) ? 0 : num;
		})
		.pipe(validationUtils.clientUnit),
	is_active: z.boolean().optional().default(true),
});

// Form schema for product updates
export const productEditFormSchema = productFormSchema.extend({
	id: validationUtils.uuid,
});

// Payment Plan Template Slot schema
export const paymentPlanTemplateSlotSchema = z.object({
	amount_due: z
		.string()
		.transform((val) => {
			const num = Number.parseFloat(val);
			return isNaN(num) ? 0 : num;
		})
		.pipe(validationUtils.amountDue),
	months_to_delay: z
		.string()
		.optional()
		.default("0")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			return isNaN(num) ? 0 : num;
		})
		.pipe(validationUtils.monthsToDelay),
});

// Payment Plan Template schema
export const paymentPlanTemplateSchema = z.object({
	name: validationUtils.name,
	program_length_months: z
		.string()
		.optional()
		.default("1")
		.transform((val) => {
			const num = Number.parseInt(val, 10);
			return isNaN(num) ? 1 : num;
		})
		.pipe(validationUtils.programLengthMonths),
	slots: z
		.array(paymentPlanTemplateSlotSchema)
		.min(1, "At least one payment slot is required"),
});

// Extended product form schema with payment plan templates
export const productWithPaymentPlanFormSchema = productFormSchema.extend({
	payment_plan_templates: z
		.array(paymentPlanTemplateSchema)
		.optional()
		.default([]),
});

// Form input type that matches what the UI actually sends (before transformation)
export type ProductFormRawInput = {
	name: string;
	description: string;
	default_duration_months: string;
	client_unit: string;
	is_active: boolean;
	payment_plan_templates: Array<{
		name: string;
		program_length_months: string;
		slots: Array<{
			amount_due: string;
			months_to_delay: string;
		}>;
	}>;
};

// Type exports for TypeScript
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductFormInput = z.infer<typeof productFormSchema>;
export type ProductEditFormInput = z.infer<typeof productEditFormSchema>;
export type PaymentPlanTemplateSlotInput = z.infer<
	typeof paymentPlanTemplateSlotSchema
>;
export type PaymentPlanTemplateInput = z.infer<
	typeof paymentPlanTemplateSchema
>;
export type ProductWithPaymentPlanFormInput = z.infer<
	typeof productWithPaymentPlanFormSchema
>;

// Product status options for UI
export const PRODUCT_STATUS_OPTIONS = [
	{ value: true, label: "Active" },
	{ value: false, label: "Inactive" },
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
export const getFieldValidator = (fieldName: keyof ProductFormInput) => {
	const fieldSchemas: Record<string, z.ZodSchema> = {
		name: validationUtils.name,
		description: validationUtils.description,
		default_duration_months: validationUtils.defaultDurationMonths,
		client_unit: validationUtils.clientUnit,
		is_active: z.boolean(),
	};

	return (value: any) => validateSingleField(value, fieldSchemas[fieldName]);
};

// Type guards for better TypeScript support
export const isProductCreateInput = (
	data: unknown,
): data is ProductCreateInput => {
	return productCreateSchema.safeParse(data).success;
};

export const isProductUpdateInput = (
	data: unknown,
): data is ProductUpdateInput => {
	return productUpdateSchema.safeParse(data).success;
};

export const isProductFormInput = (data: unknown): data is ProductFormInput => {
	return productFormSchema.safeParse(data).success;
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
