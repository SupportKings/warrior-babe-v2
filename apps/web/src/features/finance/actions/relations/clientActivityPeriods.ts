"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";

export async function deleteClientActivityPeriod(activityPeriodId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Remove the coach_payment reference from the activity period
	const { error } = await supabase
		.from("client_activity_period")
		.update({ coach_payment: null })
		.eq("id", activityPeriodId);

	if (error) {
		throw new Error(`Failed to detach activity period: ${error.message}`);
	}

	return { success: true };
}

export async function createCoachPaymentActivityPeriod(
	coachPaymentId: string,
	activityPeriodId: string,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Attach the activity period to the coach payment
	const { error } = await supabase
		.from("client_activity_period")
		.update({ coach_payment: coachPaymentId })
		.eq("id", activityPeriodId);

	if (error) {
		throw new Error(`Failed to attach activity period: ${error.message}`);
	}

	return { success: true };
}

export async function updateCoachPaymentActivityPeriod(
	activityPeriodId: string,
	updateData: { active: boolean },
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("client_activity_period")
		.update({ active: updateData.active })
		.eq("id", activityPeriodId);

	if (error) {
		throw new Error(`Failed to update activity period: ${error.message}`);
	}

	return { success: true };
}