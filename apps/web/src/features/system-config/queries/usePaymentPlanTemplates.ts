"use client";

import { createClient } from "@/utils/supabase/client";

import { useQuery } from "@tanstack/react-query";

export const paymentPlanTemplatesQueries = {
	all: () => ["payment_plan_templates"] as const,
	detail: (id: string) => ["payment_plan_templates", id] as const,
	slots: (templateId: string) =>
		["payment_plan_template_slots", templateId] as const,
};

export function usePaymentPlanTemplates() {
	const supabase = createClient();

	return useQuery({
		queryKey: paymentPlanTemplatesQueries.all(),
		queryFn: async () => {
			const { data, error } = await supabase
				.from("payment_plan_templates")
				.select(`
					id,
					name,
					product_id,
					program_length_months,
					created_at,
					updated_at,
					products (
						id,
						name,
						description
					)
				`)
				.order("name");

			if (error) {
				throw new Error(
					`Failed to fetch payment plan templates: ${error.message}`,
				);
			}

			return data;
		},
	});
}

export function usePaymentPlanTemplate(id: string) {
	const supabase = createClient();

	return useQuery({
		queryKey: paymentPlanTemplatesQueries.detail(id),
		queryFn: async () => {
			const { data, error } = await supabase
				.from("payment_plan_templates")
				.select(`
					id,
					name,
					product_id,
					program_length_months,
					created_at,
					updated_at,
					products (
						id,
						name,
						description
					)
				`)
				.eq("id", id)
				.single();

			if (error) {
				throw new Error(
					`Failed to fetch payment plan template: ${error.message}`,
				);
			}

			return data;
		},
		enabled: !!id,
	});
}

export function usePaymentPlanTemplateSlots(templateId: string) {
	const supabase = createClient();

	return useQuery({
		queryKey: paymentPlanTemplatesQueries.slots(templateId),
		queryFn: async () => {
			const { data, error } = await supabase
				.from("payment_plan_template_slots")
				.select(`
					id,
					amount_due,
					months_to_delay,
					payment_plan_template_id,
					created_at,
					updated_at
				`)
				.eq("payment_plan_template_id", templateId)
				.order("months_to_delay");

			if (error) {
				throw new Error(
					`Failed to fetch payment plan template slots: ${error.message}`,
				);
			}

			return data;
		},
		enabled: !!templateId,
	});
}
