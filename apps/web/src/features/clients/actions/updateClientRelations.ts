"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

interface ClientGoal {
	id: string;
	title: string;
	description?: string | null;
	target_value: string;
	current_value: string;
	status:
		| "pending"
		| "in_progress"
		| "completed"
		| "cancelled"
		| "overdue"
		| undefined;
	due_date: string;
	started_at: string;
	priority: "high" | "medium" | "low";
}

interface ClientWin {
	id: string;
	title: string;
	description?: string | null;
	win_date: string;
}

interface ClientAssignment {
	id: string;
	coach_id: string | null;
	start_date: string;
	end_date: string;
	assignment_type: string;
}

interface ClientActivityPeriod {
	id: string;
	active: boolean;
	start_date: string;
	end_date: string;
	coach_id: string | null;
}

interface ClientNPS {
	id: string;
	nps_score: number;
	notes: string;
	recorded_date: string;
}

interface ClientTestimonial {
	id: string;
	content: string;
	testimonial_type: string;
	testimonial_url: string;
	recorded_date: string;
}

interface ClientPaymentPlan {
	id: string;
	name: string;
	notes: string;
	platform: string;
	product_id: string;
	subscription_id: string;
	term_start_date: string;
	term_end_date: string;
	total_amount: number;
	total_amount_paid: number;
	type: "PIF" | "2-Pay" | "Split Pay" | "4-Pay" | "CUSTOM";
}

export async function updateClientGoal(clientId: string, goal: ClientGoal) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_goals")
		.update({
			client_id: clientId,
			title: goal.title,
			description: goal.description,
			target_value: goal.target_value,
			current_value: goal.current_value,
			status: goal.status,
			due_date: goal.due_date,
			started_at: goal.started_at,
			priority: goal.priority,
		})
		.eq("id", goal.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function updateClientWin(clientId: string, win: ClientWin) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_wins")
		.update({
			client_id: clientId,
			title: win.title,
			description: win.description,
			win_date: win.win_date,
		})
		.eq("id", win.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function updateClientAssignment(
	clientId: string,
	assignment: ClientAssignment,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_assignments")
		.update({
			client_id: clientId,
			user_id: assignment.coach_id,
			start_date: assignment.start_date,
			end_date: assignment.end_date.trim() === "" ? null : assignment.end_date,
			assignment_type: assignment.assignment_type,
		})
		.eq("id", assignment.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function updateClientActivityPeriod(
	clientId: string,
	activityPeriod: ClientActivityPeriod,
) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("client_activity_period")
		.update({
			client_id: clientId,
			active: activityPeriod.active,
			start_date: activityPeriod.start_date,
			end_date:
				activityPeriod.end_date.trim() === "" ? null : activityPeriod.end_date,
			coach_id: activityPeriod.coach_id,
		})
		.eq("id", activityPeriod.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function updateClientNPSScore(
	clientId: string,
	npsScore: ClientNPS,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_nps")
		.update({
			nps_score: npsScore.nps_score,
			notes: npsScore.notes,
			recorded_date: npsScore.recorded_date,
		})
		.eq("id", npsScore.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function updateClientTestimonial(
	clientId: string,
	testimonial: ClientTestimonial,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_testimonials")
		.update({
			client_id: clientId,
			content: testimonial.content,
			testimonial_type: testimonial.testimonial_type,
			testimonial_url:
				testimonial.testimonial_url.trim() === ""
					? null
					: testimonial.testimonial_url,
			recorded_date: testimonial.recorded_date,
		})
		.eq("id", testimonial.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}

export async function updateClientPaymentPlan(
	clientId: string,
	paymentPlan: ClientPaymentPlan,
) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("payment_plans")
		.update({
			client_id: clientId,
			name: paymentPlan.name,
			notes: paymentPlan.notes.trim() === "" ? null : paymentPlan.notes,
			platform:
				paymentPlan.platform.trim() === "" ? null : paymentPlan.platform,
			product_id:
				paymentPlan.product_id.trim() === "" ? null : paymentPlan.product_id,
			subscription_id:
				paymentPlan.subscription_id.trim() === ""
					? null
					: paymentPlan.subscription_id,
			term_start_date: paymentPlan.term_start_date,
			term_end_date:
				paymentPlan.term_end_date.trim() === ""
					? undefined
					: paymentPlan.term_end_date,
			total_amount: paymentPlan.total_amount,
			total_amount_paid: paymentPlan.total_amount_paid,
			type: paymentPlan.type,
		})
		.eq("id", paymentPlan.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return { success: true, data };
}
