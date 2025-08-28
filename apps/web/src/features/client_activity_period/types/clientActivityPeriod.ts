import type { Database } from "@/utils/supabase/database.types";

import { z } from "zod";

// Base type from database
export type ClientActivityPeriod =
	Database["public"]["Tables"]["client_activity_period"]["Row"];
export type ClientActivityPeriodInsert =
	Database["public"]["Tables"]["client_activity_period"]["Insert"];
export type ClientActivityPeriodUpdate =
	Database["public"]["Tables"]["client_activity_period"]["Update"];

// Form input schemas
export const clientActivityPeriodFormSchema = z.object({
	client_id: z.string().min(1, "Client is required"),
	coach_id: z.string().nullable().optional(),
	start_date: z.string().min(1, "Start date is required"),
	end_date: z.string().optional().nullable(),
	active: z.boolean().default(true),
});

export const clientActivityPeriodEditFormSchema =
	clientActivityPeriodFormSchema.extend({
		id: z.string().min(1, "ID is required"),
	});

// Form input types
export type ClientActivityPeriodFormInput = z.infer<
	typeof clientActivityPeriodFormSchema
>;
export type ClientActivityPeriodEditFormInput = z.infer<
	typeof clientActivityPeriodEditFormSchema
>;

// Extended types with relations for display
export type ClientActivityPeriodWithRelations = ClientActivityPeriod & {
	client?: {
		id: string;
		name: string;
		email: string;
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
