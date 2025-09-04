"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { addMonths, format } from "date-fns";

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
	product_id: string;
	term_start_date: string;
	term_end_date: string;
	total_amount: number;
	type: string; // This is now the payment_plan_template ID
	payment_slots?: PaymentSlot[];
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
					product_id: plan.product_id,
					term_start_date: plan.term_start_date,
					term_end_date: plan.term_end_date,
					total_amount: plan.total_amount,
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
					product_id: plan.product_id,
					term_start_date: plan.term_start_date,
					term_end_date: plan.term_end_date,
					total_amount: plan.total_amount,
					type: plan.type,
				})
				.select("id")
				.single();

			// Handle payment slots for new plan
			if (newPlan) {
				if (plan.payment_slots && plan.payment_slots.length > 0) {
					// Use manually provided payment slots
					await savePaymentSlots(newPlan.id, plan.payment_slots);
				} else if (plan.type === "custom" && (plan as any).customSlots) {
					// Create custom payment slots
					await createPaymentSlotsFromCustom(
						newPlan.id,
						(plan as any).customSlots,
						plan.term_start_date,
					);
				} else if (plan.type && plan.type !== "custom") {
					// Auto-create payment slots from template
					await createPaymentSlotsFromTemplate(
						newPlan.id,
						plan.type,
						plan.term_start_date,
					);
				}
			}
		}
	}

	return { success: true };
}

export async function updateClientPaymentPlan(
	paymentPlanId: string,
	paymentPlanData: Partial<ClientPaymentPlan>,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("payment_plans")
		.update({
			...paymentPlanData,
			updated_at: new Date().toISOString(),
		})
		.eq("id", paymentPlanId);

	if (error) {
		throw new Error(`Failed to update payment plan: ${error.message}`);
	}

	return { success: true };
}

export async function deleteClientPaymentPlan(paymentPlanId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("payment_plans")
		.delete()
		.eq("id", paymentPlanId);

	if (error) {
		throw new Error(`Failed to delete payment plan: ${error.message}`);
	}

	return { success: true };
}

export async function createClientPaymentPlan(
	clientId: string,
	paymentPlanData: Omit<ClientPaymentPlan, "id">,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("payment_plans")
		.insert({
			client_id: clientId,
			...paymentPlanData,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create payment plan: ${error.message}`);
	}

	// Auto-create payment slots based on type
	if (data && paymentPlanData.type) {
		if (
			paymentPlanData.type === "custom" &&
			(paymentPlanData as any).customSlots
		) {
			await createPaymentSlotsFromCustom(
				data.id,
				(paymentPlanData as any).customSlots,
				paymentPlanData.term_start_date,
			);
		} else if (paymentPlanData.type !== "custom") {
			await createPaymentSlotsFromTemplate(
				data.id,
				paymentPlanData.type,
				paymentPlanData.term_start_date,
			);
		}
	}

	return { success: true, data };
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

export async function createPaymentSlotsFromTemplate(
	planId: string,
	templateId: string,
	termStartDate: string,
) {
	const supabase = await createClient();

	// Fetch template slots
	const { data: templateSlots, error: slotsError } = await supabase
		.from("payment_plan_template_slots")
		.select("*")
		.eq("payment_plan_template_id", templateId)
		.order("months_to_delay");

	if (slotsError) {
		throw new Error(`Failed to fetch template slots: ${slotsError.message}`);
	}

	if (!templateSlots || templateSlots.length === 0) {
		return { success: true, slots: [] };
	}

	const startDate = new Date(termStartDate);
	const slotsToCreate = templateSlots.map((templateSlot) => {
		const dueDate = addMonths(startDate, templateSlot.months_to_delay);

		return {
			plan_id: planId,
			amount_due: templateSlot.amount_due,
			amount_paid: 0,
			due_date: format(dueDate, "yyyy-MM-dd"),
			notes: "Auto-generated from template",
			payment_id: null,
		};
	});

	// Create payment slots
	const { data: createdSlots, error: createError } = await supabase
		.from("payment_slots")
		.insert(slotsToCreate)
		.select();

	if (createError) {
		throw new Error(`Failed to create payment slots: ${createError.message}`);
	}

	return { success: true, slots: createdSlots };
}

export async function createPaymentSlotsFromCustom(
	planId: string,
	customSlots: Array<{ amount_due: number; months_to_delay: number }>,
	termStartDate: string,
) {
	const supabase = await createClient();

	if (!customSlots || customSlots.length === 0) {
		return { success: true, slots: [] };
	}

	const startDate = new Date(termStartDate);
	const slotsToCreate = customSlots.map((customSlot) => {
		const dueDate = addMonths(startDate, customSlot.months_to_delay);

		return {
			plan_id: planId,
			amount_due: customSlot.amount_due,
			amount_paid: 0,
			due_date: format(dueDate, "yyyy-MM-dd"),
			notes: "Custom payment slot",
			payment_id: null,
		};
	});

	// Create payment slots
	const { data: createdSlots, error: createError } = await supabase
		.from("payment_slots")
		.insert(slotsToCreate)
		.select();

	if (createError) {
		throw new Error(`Failed to create payment slots: ${createError.message}`);
	}

	return { success: true, slots: createdSlots };
}
