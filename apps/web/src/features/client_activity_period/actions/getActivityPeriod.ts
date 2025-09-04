"use server";

import { createClient } from "@/utils/supabase/server";

export async function getActivityPeriod(id: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("client_activity_period")
		.select(`
			*,
			payment_plan_detail:payment_plans!client_activity_period_payment_plan_fkey(
				id,
				name,
				term_start_date,
				term_end_date,
				total_amount,
				client:clients!payment_plans_client_id_fkey(
					id,
					name,
					email
				)
			),
			coach:team_members!client_activity_period_coach_id_fkey(
				id,
				name
			),
			coach_payment_detail:coach_payments!client_activity_period_coach_payment_fkey(
				id,
				amount,
				date,
				status
			)
		`)
		.eq("id", id)
		.single();

	if (error) {
		console.error("Error fetching activity period:", error);
		throw new Error("Failed to fetch activity period");
	}

	// Flatten the client data from the nested structure
	const flattenedData = {
		...data,
		client: data?.payment_plan_detail?.client || null,
		payment_plan_detail: data?.payment_plan_detail
			? {
					id: data.payment_plan_detail.id,
					name: data.payment_plan_detail.name,
					term_start_date: data.payment_plan_detail.term_start_date,
					term_end_date: data.payment_plan_detail.term_end_date,
					total_amount: data.payment_plan_detail.total_amount,
				}
			: null,
	};

	return flattenedData;
}
