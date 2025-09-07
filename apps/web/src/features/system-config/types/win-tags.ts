import type { Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Main entity type
export type WinTag = Tables<"win_tags">;

// Entity with relations (if needed for display)
export type WinTagWithRelations = WinTag & {
	// Add any related data here if needed
};

// Validation utilities
export const winTagValidation = {
	// Field validators
	name: z
		.string()
		.min(1, "Tag name is required")
		.max(50, "Tag name must be 50 characters or less")
		.regex(
			/^[a-zA-Z0-9\s-]+$/,
			"Tag name can only contain letters, numbers, spaces, and hyphens",
		),

	color: z
		.string()
		.min(1, "Color is required")
		.regex(
			/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
			"Please enter a valid hex color code",
		),

	id: z.string().uuid("Invalid ID format"),
};

// Create schema - strict validation for server
export const winTagCreateSchema = z.object({
	name: winTagValidation.name,
	color: winTagValidation.color,
});

// Update schema - with optional fields and ID required
export const winTagUpdateSchema = z.object({
	id: winTagValidation.id,
	name: winTagValidation.name.optional(),
	color: winTagValidation.color.optional(),
});

// Form schema - form-friendly with defaults
export const winTagFormSchema = z.object({
	name: z.string().default(""),
	color: z.string().default("#3b82f6"),
});

// Edit form schema - extending form schema with ID
export const winTagEditFormSchema = winTagFormSchema.extend({
	id: winTagValidation.id,
});

// Export TypeScript types
export type WinTagCreate = z.infer<typeof winTagCreateSchema>;
export type WinTagUpdate = z.infer<typeof winTagUpdateSchema>;
export type WinTagForm = z.infer<typeof winTagFormSchema>;
export type WinTagEditForm = z.infer<typeof winTagEditFormSchema>;

// Validation helper functions
export const validateSingleField = (
	field: keyof WinTagForm,
	value: unknown,
) => {
	const schema = winTagFormSchema.shape[field];
	if (!schema) return { success: false, error: "Invalid field" };

	const result = schema.safeParse(value);
	if (!result.success) {
		return {
			success: false,
			error: result.error.errors[0]?.message || "Validation failed",
		};
	}
	return { success: true, data: result.data };
};

export const getAllValidationErrors = (data: unknown) => {
	const result = winTagCreateSchema.safeParse(data);
	if (!result.success) {
		return result.error.errors.map((err) => ({
			field: err.path.join("."),
			message: err.message,
		}));
	}
	return [];
};

// Type guards
export const isWinTag = (value: unknown): value is WinTag => {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"name" in value &&
		"color" in value
	);
};
