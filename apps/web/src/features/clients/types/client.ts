import { z } from "zod";

// Base client schema for creation
export const clientCreateSchema = z.object({
	first_name: z.string().min(2, "First name must be at least 2 characters"),
	last_name: z.string().min(2, "Last name must be at least 2 characters"),
	email: z.string().email({ message: "Invalid email address" }),
	phone: z.string().optional(),
	start_date: z.string().min(1, "Start date is required"),
	end_date: z.string().optional(),
	renewal_date: z.string().optional(),
	product_id: z.string().optional(),
	created_by: z.string().optional(), // Foreign key to users
	status: z.string().optional(),
	platform_access_status: z.string().optional(),
	platform_link: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
	consultation_form_completed: z.boolean().optional().default(false),
	vip_terms_signed: z.boolean().optional().default(false),
	onboarding_notes: z.string().optional(),
});

// Schema for client updates (all fields optional except id)
export const clientUpdateSchema = z.object({
	id: z.string().uuid("Invalid client ID"),
	first_name: z.string().min(2, "First name must be at least 2 characters").optional(),
	last_name: z.string().min(2, "Last name must be at least 2 characters").optional(),
	email: z.string().email("Invalid email address").optional(),
	phone: z.string().optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	renewal_date: z.string().optional(),
	product_id: z.string().optional(),
	status: z.string().optional(),
	platform_access_status: z.string().optional(),
	platform_link: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
	consultation_form_completed: z.boolean().optional(),
	vip_terms_signed: z.boolean().optional(),
	onboarding_notes: z.string().optional(),
	churned_at: z.string().optional(),
	paused_at: z.string().optional(),
	offboard_date: z.string().optional(),
});

// Form schema for client creation (used in forms)
export const clientFormSchema = z.object({
	first_name: z.string().min(2, "First name must be at least 2 characters"),
	last_name: z.string().min(2, "Last name must be at least 2 characters"),
	email: z.string().email({ message: "Invalid email address" }),
	phone: z.string().optional().default(""),
	start_date: z.string().min(1, "Start date is required"),
	end_date: z.string().optional().default(""),
	renewal_date: z.string().optional().default(""),
	product_id: z.string().optional().default(""),
	status: z.string().optional().default("active"),
	platform_access_status: z.string().optional().default("pending"),
	platform_link: z.string().optional().default(""),
	consultation_form_completed: z.boolean().optional().default(false),
	vip_terms_signed: z.boolean().optional().default(false),
	onboarding_notes: z.string().optional().default(""),
});

// Form schema for client updates
export const clientEditFormSchema = clientFormSchema.extend({
	id: z.string().uuid("Invalid client ID"),
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