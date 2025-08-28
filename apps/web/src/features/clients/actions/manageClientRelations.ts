"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

interface ClientGoal {
	id?: string;
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
	id?: string;
	title: string;
	description?: string | null;
	win_date: string;
}

interface ClientAssignment {
	id?: string;
	coach_id: string | null;
	start_date: string;
	end_date: string | null;
	assignment_type: string;
}

interface ClientActivityPeriod {
	id?: string;
	active: boolean;
	start_date: string;
	end_date: string;
	coach_id: string | null;
}

interface ClientNPS {
	id?: string;
	nps_score: number;
	notes: string;
	recorded_date: string;
}

interface ClientTestimonial {
	id?: string;
	content: string;
	testimonial_type: string;
	testimonial_url: string;
	recorded_date: string;
}

interface PaymentSlot {
	id?: string;
	amount_due: number;
	amount_paid: number;
	due_date: string;
	notes: string;
	payment_id: string;
}

interface ClientPaymentPlan {
	id?: string;
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
	payment_slots?: PaymentSlot[];
}

export async function saveClientGoals(clientId: string, goals: ClientGoal[]) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get existing goals to compare
	const { data: existingGoals } = await supabase
		.from("client_goals")
		.select("id")
		.eq("client_id", clientId);

	const existingIds = existingGoals?.map((g) => g.id) || [];
	const currentIds = goals.filter((g) => g.id).map((g) => g.id);
	const toDelete = existingIds.filter((id) => !currentIds.includes(id));

	// Delete removed goals
	if (toDelete.length > 0) {
		await supabase.from("client_goals").delete().in("id", toDelete);
	}

	// Upsert goals
	for (const goal of goals) {
		if (goal.id) {
			// Update existing
			await supabase
				.from("client_goals")
				.update({
					title: goal.title,
					description: goal.description,
					target_value: goal.target_value,
					current_value: goal.current_value,
					status: goal.status,
					due_date: goal.due_date,
					started_at: goal.started_at,
					priority: goal.priority,
					updated_by: user.user.id,
					updated_at: new Date().toISOString(),
				})
				.eq("id", goal.id);
		} else {
			// Create new
			await supabase.from("client_goals").insert({
				client_id: clientId,
				title: goal.title,
				description: goal.description,
				target_value: goal.target_value,
				current_value: goal.current_value,
				status: goal.status,
				due_date: goal.due_date,
				started_at: goal.started_at,
				priority: goal.priority,
				created_by: user.user.id,
			});
		}
	}

	return { success: true };
}

export async function saveClientWins(clientId: string, wins: ClientWin[]) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get existing wins to compare
	const { data: existingWins } = await supabase
		.from("client_wins")
		.select("id")
		.eq("client_id", clientId);

	const existingIds = existingWins?.map((w) => w.id) || [];
	const currentIds = wins.filter((w) => w.id).map((w) => w.id);
	const toDelete = existingIds.filter((id) => !currentIds.includes(id));

	// Delete removed wins
	if (toDelete.length > 0) {
		await supabase.from("client_wins").delete().in("id", toDelete);
	}

	// Upsert wins
	for (const win of wins) {
		if (win.id) {
			// Update existing
			await supabase
				.from("client_wins")
				.update({
					title: win.title,
					description: win.description,
					win_date: win.win_date,
				})
				.eq("id", win.id);
		} else {
			// Create new
			await supabase.from("client_wins").insert({
				client_id: clientId,
				title: win.title,
				description: win.description,
				win_date: win.win_date,
				recorded_by: user.user.id,
			});
		}
	}

	return { success: true };
}

export async function saveClientAssignments(
	clientId: string,
	assignments: ClientAssignment[],
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get existing assignments to compare
	const { data: existingAssignments } = await supabase
		.from("client_assignments")
		.select("id")
		.eq("client_id", clientId);

	const existingIds = existingAssignments?.map((a) => a.id) || [];
	const currentIds = assignments.filter((a) => a.id).map((a) => a.id);
	const toDelete = existingIds.filter((id) => !currentIds.includes(id));

	// Delete removed assignments
	if (toDelete.length > 0) {
		await supabase.from("client_assignments").delete().in("id", toDelete);
	}

	// Upsert assignments
	for (const assignment of assignments) {
		if (assignment.id) {
			// Update existing
			await supabase
				.from("client_assignments")
				.update({
					user_id: assignment.coach_id,
					start_date: assignment.start_date,
					end_date: assignment.end_date,
					assignment_type: assignment.assignment_type,
				})
				.eq("id", assignment.id);
		} else {
			// Create new
			await supabase.from("client_assignments").insert({
				client_id: clientId,
				user_id: assignment.coach_id,
				start_date: assignment.start_date,
				end_date: assignment.end_date,
				assignment_type: assignment.assignment_type,
				assigned_by: user.user.id,
			});
		}
	}

	return { success: true };
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
				})
				.eq("id", period.id);
		} else {
			// Create new
			await supabase.from("client_activity_period").insert({
				client_id: clientId,
				active: period.active,
				start_date: period.start_date,
				end_date: period.end_date || null,
				coach_id: period.coach_id,
			});
		}
	}

	return { success: true };
}

export async function saveClientNPSScores(
	clientId: string,
	npsScores: ClientNPS[],
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get existing NPS scores to compare
	const { data: existingNPS } = await supabase
		.from("client_nps")
		.select("id")
		.eq("provided_by", clientId);

	const existingIds = existingNPS?.map((n) => n.id) || [];
	const currentIds = npsScores.filter((n) => n.id).map((n) => n.id);
	const toDelete = existingIds.filter((id) => !currentIds.includes(id));

	// Delete removed NPS scores
	if (toDelete.length > 0) {
		await supabase.from("client_nps").delete().in("id", toDelete);
	}

	// Upsert NPS scores
	for (const nps of npsScores) {
		if (nps.id) {
			// Update existing
			await supabase
				.from("client_nps")
				.update({
					nps_score: nps.nps_score,
					notes: nps.notes,
					provided_by: clientId,
					recorded_by: user.user.id,
					recorded_date: nps.recorded_date,
				})
				.eq("id", nps.id);
		} else {
			// Create new
			await supabase.from("client_nps").insert({
				nps_score: nps.nps_score,
				notes: nps.notes,
				provided_by: clientId,
				recorded_by: user.user.id,
				recorded_date: nps.recorded_date,
			});
		}
	}

	return { success: true };
}

export async function saveClientTestimonials(
	clientId: string,
	testimonials: ClientTestimonial[],
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get existing testimonials to compare
	const { data: existingTestimonials } = await supabase
		.from("client_testimonials")
		.select("id")
		.eq("client_id", clientId);

	const existingIds = existingTestimonials?.map((t) => t.id) || [];
	const currentIds = testimonials.filter((t) => t.id).map((t) => t.id);
	const toDelete = existingIds.filter((id) => !currentIds.includes(id));

	// Delete removed testimonials
	if (toDelete.length > 0) {
		await supabase.from("client_testimonials").delete().in("id", toDelete);
	}

	// Upsert testimonials
	for (const testimonial of testimonials) {
		if (testimonial.id) {
			// Update existing
			await supabase
				.from("client_testimonials")
				.update({
					content: testimonial.content,
					testimonial_type: testimonial.testimonial_type,
					testimonial_url: testimonial.testimonial_url || null,
					recorded_by: user.user.id,
					recorded_date: testimonial.recorded_date,
				})
				.eq("id", testimonial.id);
		} else {
			// Create new
			await supabase.from("client_testimonials").insert({
				client_id: clientId,
				content: testimonial.content,
				testimonial_type: testimonial.testimonial_type,
				testimonial_url: testimonial.testimonial_url || null,
				recorded_by: user.user.id,
				recorded_date: testimonial.recorded_date,
			});
		}
	}

	return { success: true };
}

export async function saveClientPaymentPlans(
	clientId: string,
	paymentPlans: ClientPaymentPlan[],
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get existing payment plans to compare
	const { data: existingPlans } = await supabase
		.from("payment_plans")
		.select("id")
		.eq("client_id", clientId);

	const existingIds = existingPlans?.map((p) => p.id) || [];
	const currentIds = paymentPlans.filter((p) => p.id).map((p) => p.id);
	const toDelete = existingIds.filter((id) => !currentIds.includes(id));

	// Delete removed payment plans (this will cascade delete payment slots)
	if (toDelete.length > 0) {
		await supabase.from("payment_plans").delete().in("id", toDelete);
	}

	// Upsert payment plans
	for (const plan of paymentPlans) {
		if (plan.id) {
			// Update existing
			await supabase
				.from("payment_plans")
				.update({
					name: plan.name,
					notes: plan.notes,
					platform: plan.platform,
					product_id: plan.product_id,
					subscription_id: plan.subscription_id,
					term_start_date: plan.term_start_date,
					term_end_date: plan.term_end_date,
					total_amount: plan.total_amount,
					total_amount_paid: plan.total_amount_paid,
					type: plan.type,
					updated_at: new Date().toISOString(),
				})
				.eq("id", plan.id);

			// Handle payment slots for existing plan
			if (plan.payment_slots) {
				await savePaymentSlots(plan.id, plan.payment_slots);
			}
		} else {
			// Create new
			const { data: newPlan } = await supabase
				.from("payment_plans")
				.insert({
					client_id: clientId,
					name: plan.name,
					notes: plan.notes,
					platform: plan.platform,
					product_id: plan.product_id,
					subscription_id: plan.subscription_id,
					term_start_date: plan.term_start_date,
					term_end_date: plan.term_end_date,
					total_amount: plan.total_amount,
					total_amount_paid: plan.total_amount_paid,
					type: plan.type,
				})
				.select("id")
				.single();

			// Handle payment slots for new plan
			if (newPlan && plan.payment_slots) {
				await savePaymentSlots(newPlan.id, plan.payment_slots);
			}
		}
	}

	return { success: true };
}

export async function savePaymentSlots(
	planId: string,
	paymentSlots: PaymentSlot[],
) {
	const supabase = await createClient();

	// Get existing payment slots to compare
	const { data: existingSlots } = await supabase
		.from("payment_slots")
		.select("id")
		.eq("plan_id", planId);

	const existingIds = existingSlots?.map((s) => s.id) || [];
	const currentIds = paymentSlots.filter((s) => s.id).map((s) => s.id);
	const toDelete = existingIds.filter((id) => !currentIds.includes(id));

	// Delete removed payment slots
	if (toDelete.length > 0) {
		await supabase.from("payment_slots").delete().in("id", toDelete);
	}

	// Upsert payment slots
	for (const slot of paymentSlots) {
		if (slot.id) {
			// Update existing
			await supabase
				.from("payment_slots")
				.update({
					amount_due: slot.amount_due,
					amount_paid: slot.amount_paid,
					due_date: slot.due_date,
					notes: slot.notes,
					payment_id: slot.payment_id,
				})
				.eq("id", slot.id);
		} else {
			// Create new
			await supabase.from("payment_slots").insert({
				plan_id: planId,
				amount_due: slot.amount_due,
				amount_paid: slot.amount_paid,
				due_date: slot.due_date,
				notes: slot.notes,
				payment_id: slot.payment_id,
			});
		}
	}

	return { success: true };
}
