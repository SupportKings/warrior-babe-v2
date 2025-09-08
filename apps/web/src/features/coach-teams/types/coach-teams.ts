import type { Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Main entity types
export type CoachTeams = Tables<"coach_teams">;
export type TeamMember = Tables<"team_members">;

// Entity with relations
export type CoachTeamsWithRelations = CoachTeams & {
	premier_coach?: TeamMember | null;
	coach?: TeamMember | null;
	team_members?: TeamMember[] | null;
};

// Validation utilities
export const coachTeamsValidation = {
	// Field validations
	teamName: z
		.string()
		.min(1, "Team name is required")
		.max(100, "Team name must be 100 characters or less"),

	premierCoachId: z
		.string()
		.uuid("Invalid coach ID format")
		.min(1, "Premier coach is required"),

	coachId: z.string().uuid("Invalid coach ID format").optional().nullable(),

	// Helper for optional strings
	optionalString: z.string().optional().nullable(),
};

// Create schema for server-side validation
export const coachTeamsCreateSchema = z.object({
	team_name: coachTeamsValidation.teamName,
	premier_coach_id: coachTeamsValidation.premierCoachId,
	coach_id: coachTeamsValidation.coachId,
});

// Update schema with optional fields and required ID
export const coachTeamsUpdateSchema = z.object({
	id: z.string().uuid("Invalid ID format"),
	team_name: coachTeamsValidation.teamName.optional(),
	premier_coach_id: coachTeamsValidation.premierCoachId.optional(),
	coach_id: coachTeamsValidation.coachId,
});

// Form-friendly schema with defaults
export const coachTeamsFormSchema = z.object({
	team_name: z.string().default(""),
	premier_coach_id: z.string().default(""),
	coach_id: z.string().default("").optional().nullable(),
});

// Edit form schema extending form schema with ID
export const coachTeamsEditFormSchema = coachTeamsFormSchema.extend({
	id: z.string().uuid(),
});

// TypeScript types for schemas
export type CoachTeamsCreateInput = z.infer<typeof coachTeamsCreateSchema>;
export type CoachTeamsUpdateInput = z.infer<typeof coachTeamsUpdateSchema>;
export type CoachTeamsFormInput = z.infer<typeof coachTeamsFormSchema>;
export type CoachTeamsEditFormInput = z.infer<typeof coachTeamsEditFormSchema>;

// Validation helper functions
export const validateSingleField = (
	fieldName: keyof CoachTeamsFormInput,
	value: unknown,
): { success: boolean; error?: string } => {
	try {
		const fieldSchema = coachTeamsFormSchema.shape[fieldName];
		if (fieldSchema) {
			fieldSchema.parse(value);
		}
		return { success: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message || "Validation failed",
			};
		}
		return { success: false, error: "Validation failed" };
	}
};

export const getAllValidationErrors = (
	error: unknown,
): Record<string, string[]> => {
	if (error instanceof z.ZodError) {
		const errors: Record<string, string[]> = {};
		error.issues.forEach((issue) => {
			const path = issue.path.join(".");
			if (!errors[path]) {
				errors[path] = [];
			}
			errors[path].push(issue.message);
		});
		return errors;
	}
	return {};
};
