"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function deleteClientGoal(goalId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_goals")
		.delete()
		.eq("id", goalId)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function deleteClientWin(winId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_wins")
		.delete()
		.eq("id", winId)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function deleteClientAssignment(assignmentId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_assignments")
		.delete()
		.eq("id", assignmentId)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function deleteClientActivityPeriod(activityPeriodId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("client_activity_period")
		.delete()
		.eq("id", activityPeriodId)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function deleteClientNPSScore(npsId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_nps")
		.delete()
		.eq("id", npsId)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function deleteClientTestimonial(testimonialId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_testimonials")
		.delete()
		.eq("id", testimonialId)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function deleteClientPaymentPlan(paymentPlanId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("payment_plans")
		.delete()
		.eq("id", paymentPlanId)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}
