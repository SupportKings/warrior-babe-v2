"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

interface ClientActivityPeriod {
	id?: string;
	active: boolean;
	start_date: string;
	end_date: string;
	coach_id: string | null;
	payment_plan?: string | null;
}

export async function saveClientActivityPeriods(
	clientId: string,
	activityPeriods: ClientActivityPeriod[],
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get existing activity periods to compare
	const { data: existingPeriods } = await supabase
		.from("client_activity_period")
		.select("id")
		.eq("client_id", clientId);

	const existingIds = existingPeriods?.map((p) => p.id) || [];
	const currentIds = activityPeriods.filter((p) => p.id).map((p) => p.id);
	const toDelete = existingIds.filter((id) => !currentIds.includes(id));

	// Delete removed activity periods
	if (toDelete.length > 0) {
		await supabase.from("client_activity_period").delete().in("id", toDelete);
	}

	// Upsert activity periods
	for (const period of activityPeriods) {
		if (period.id) {
			// Update existing
			await supabase
				.from("client_activity_period")
				.update({
					active: period.active,
					start_date: period.start_date,
					end_date: period.end_date || null,
					coach_id: period.coach_id,
					payment_plan: period.payment_plan || null,
				})
				.eq("id", period.id);
		} else {
			// Create new
			await supabase.from("client_activity_period").insert({
				active: period.active,
				start_date: period.start_date,
				end_date: period.end_date || null,
				coach_id: period.coach_id,
				payment_plan: period.payment_plan || null,
			});
		}
	}

	return { success: true };
}

export async function updateClientActivityPeriod(
	activityPeriodId: string,
	activityPeriodData: Partial<ClientActivityPeriod>,
) {
	const supabase = await createClient();
	const user = await getUser();
	console.log("Updating activity period", activityPeriodId, activityPeriodData);
	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("client_activity_period")
		.update(activityPeriodData)
		.eq("id", activityPeriodId);

	if (error) {
		throw new Error(`Failed to update activity period: ${error.message}`);
	}

	return { success: true };
}

export async function deleteClientActivityPeriod(activityPeriodId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("client_activity_period")
		.delete()
		.eq("id", activityPeriodId);

	if (error) {
		throw new Error(`Failed to delete activity period: ${error.message}`);
	}

	return { success: true };
}

export async function createClientActivityPeriod(
	clientId: string,
	activityPeriodData: Omit<ClientActivityPeriod, "id">,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_activity_period")
		.insert({
			client_id: clientId,
			...activityPeriodData,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create activity period: ${error.message}`);
	}

	return { success: true, data };
}
