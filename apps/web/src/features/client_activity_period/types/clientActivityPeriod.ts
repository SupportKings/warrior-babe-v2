import type { Database, Tables } from "@/utils/supabase/database.types";

import { z } from "zod";

// Base type from database
export type ClientActivityPeriod = Tables<"client_activity_period">;
export type ClientActivityPeriodInsert =
	Database["public"]["Tables"]["client_activity_period"]["Insert"];
export type ClientActivityPeriodUpdate =
	Database["public"]["Tables"]["client_activity_period"]["Update"];

// Form input schemas
export const clientActivityPeriodFormSchema = z.object({
	payment_plan: z.string().optional().nullable(),
	coach_id: z.string().optional().nullable(),
	start_date: z.string(),
	end_date: z.string().optional().nullable(),
	active: z.boolean().default(true),
}).refine(
	(data) => {
		// Only validate date constraint if both dates are provided
		if (!data.start_date || !data.end_date) {
			return true;
		}
		return new Date(data.end_date) >= new Date(data.start_date);
	},
	{
		message: "End date cannot be before start date",
		path: ["end_date"],
	}
);

export const clientActivityPeriodCreateSchema = clientActivityPeriodFormSchema;

export const clientActivityPeriodUpdateSchema =
	clientActivityPeriodFormSchema.extend({
		id: z.string(),
	});

export const clientActivityPeriodEditFormSchema =
	clientActivityPeriodUpdateSchema;

// Form input types
export type ClientActivityPeriodFormInput = z.infer<
	typeof clientActivityPeriodFormSchema
>;
export type ClientActivityPeriodCreateInput = z.infer<
	typeof clientActivityPeriodCreateSchema
>;
export type ClientActivityPeriodUpdateInput = z.infer<
	typeof clientActivityPeriodUpdateSchema
>;
export type ClientActivityPeriodEditFormInput = z.infer<
	typeof clientActivityPeriodEditFormSchema
>;

// Validation helper functions
export const validateSingleField = <T>(
	field: keyof ClientActivityPeriodFormInput,
	value: T,
) => {
	try {
		const fieldSchema = clientActivityPeriodFormSchema.shape[field];
		fieldSchema.parse(value);
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.issues[0]?.message || "Invalid field";
		}
		return "Validation error";
	}
};

export const getAllValidationErrors = (
	data: Partial<ClientActivityPeriodFormInput>,
) => {
	try {
		clientActivityPeriodFormSchema.parse(data);
		return {};
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.issues.reduce(
				(acc: Record<string, string>, err: z.ZodIssue) => {
					const path = err.path.join(".");
					acc[path] = err.message;
					return acc;
				},
				{} as Record<string, string>,
			);
		}
		return {};
	}
};

// Extended types with relations for display
export type ClientActivityPeriodWithRelations = ClientActivityPeriod & {
	payment_plan?: {
		id: string;
		name: string;
		client?: {
			id: string;
			name: string;
			email: string;
		} | null;
	} | null;
	coach?: {
		id: string;
		name: string | null;
		user: {
			id: string;
			name: string;
			email: string;
		} | null;
	} | null;
};
