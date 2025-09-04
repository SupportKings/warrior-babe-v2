"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function deleteProductPaymentPlanTemplate(templateId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Check if this template is being used by any payment plans
	const { count: planCount, error: checkError } = await supabase
		.from("payment_plans")
		.select("*", { count: "exact", head: true })
		.eq("type", templateId);

	if (checkError) {
		throw new Error(
			`Failed to check payment plan usage: ${checkError.message}`,
		);
	}

	if (planCount && planCount > 0) {
		throw new Error(
			`Cannot delete this payment plan template. It is currently being used by ${planCount} payment plan${planCount > 1 ? "s" : ""}. Please remove or update those payment plans first.`,
		);
	}

	// First delete all payment plan template slots
	const { error: slotsError } = await supabase
		.from("payment_plan_template_slots")
		.delete()
		.eq("payment_plan_template_id", templateId);

	if (slotsError) {
		throw new Error(
			`Failed to delete payment plan template slots: ${slotsError.message}`,
		);
	}

	// Then delete the payment plan template
	const { error } = await supabase
		.from("payment_plan_templates")
		.delete()
		.eq("id", templateId);

	if (error) {
		throw new Error(`Failed to delete payment plan template: ${error.message}`);
	}

	return { success: true };
}

export async function createProductPaymentPlanTemplate(
	productId: string,
	templateData: any,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Extract slots from templateData
	const { slots, ...templateFields } = templateData;

	// Create the payment plan template
	const { data: template, error: templateError } = await supabase
		.from("payment_plan_templates")
		.insert({
			product_id: productId,
			name: templateFields.name,
			program_length_months: templateFields.program_length_months,
		})
		.select()
		.single();

	if (templateError) {
		throw new Error(
			`Failed to create payment plan template: ${templateError.message}`,
		);
	}

	// Create payment plan template slots if provided
	if (slots && slots.length > 0) {
		const slotsToInsert = slots.map((slot: any) => ({
			payment_plan_template_id: template.id,
			amount_due: slot.amount_due,
			months_to_delay: slot.months_to_delay,
		}));

		const { error: slotsError } = await supabase
			.from("payment_plan_template_slots")
			.insert(slotsToInsert);

		if (slotsError) {
			// Rollback - delete the template if slots creation fails
			await supabase
				.from("payment_plan_templates")
				.delete()
				.eq("id", template.id);

			throw new Error(
				`Failed to create payment plan template slots: ${slotsError.message}`,
			);
		}
	}

	return { success: true, data: template };
}

export async function updateProductPaymentPlanTemplate(
	templateId: string,
	templateData: any,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Extract slots from templateData
	const { slots, ...templateFields } = templateData;

	// Update the payment plan template
	const { error: updateError } = await supabase
		.from("payment_plan_templates")
		.update({
			name: templateFields.name,
			program_length_months: templateFields.program_length_months,
			updated_at: new Date().toISOString(),
		})
		.eq("id", templateId);

	if (updateError) {
		throw new Error(
			`Failed to update payment plan template: ${updateError.message}`,
		);
	}

	// Delete existing slots and recreate them
	if (slots !== undefined) {
		// Delete existing slots
		const { error: deleteError } = await supabase
			.from("payment_plan_template_slots")
			.delete()
			.eq("payment_plan_template_id", templateId);

		if (deleteError) {
			throw new Error(
				`Failed to delete existing slots: ${deleteError.message}`,
			);
		}

		// Create new slots
		if (slots.length > 0) {
			const slotsToInsert = slots.map((slot: any) => ({
				payment_plan_template_id: templateId,
				amount_due: slot.amount_due,
				months_to_delay: slot.months_to_delay,
			}));

			const { error: slotsError } = await supabase
				.from("payment_plan_template_slots")
				.insert(slotsToInsert);

			if (slotsError) {
				throw new Error(
					`Failed to create payment plan template slots: ${slotsError.message}`,
				);
			}
		}
	}

	return { success: true };
}
