"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { getClientAssignedCoach } from "../../clients/actions/relations/getClientAssignedCoach";
import { createClientActivityPeriodAction } from "../actions/createClientActivityPeriod";

/**
 * Calculate the next Saturday that is at least a week away from the given date
 */
function getNextSaturday(fromDate: Date): Date {
	const date = new Date(fromDate);
	const daysUntilSaturday = (6 - date.getDay()) % 7;
	const nextSaturday = new Date(date);

	// If today is Saturday or the next Saturday is less than 7 days away,
	// go to the Saturday after that
	if (daysUntilSaturday === 0 || daysUntilSaturday < 7) {
		nextSaturday.setDate(date.getDate() + daysUntilSaturday + 7);
	} else {
		nextSaturday.setDate(date.getDate() + daysUntilSaturday);
	}

	return nextSaturday;
}

/**
 * Generate activity periods from the paid slot until the next payment slot's due date
 */
export async function generateActivityPeriods(paymentSlotId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	try {
		// Get the payment slot and related payment plan info
		const { data: paymentSlot, error: slotError } = await supabase
			.from("payment_slots")
			.select(`
				id,
				plan_id,
				due_date,
				payment_plans!inner(
					id,
					client_id,
					term_start_date,
					term_end_date,
					clients!inner(
						id,
						name
					)
				)
			`)
			.eq("id", paymentSlotId)
			.single();

		if (slotError || !paymentSlot) {
			throw new Error("Payment slot not found");
		}

		const paymentPlan = paymentSlot.payment_plans;
		const client = paymentPlan.clients;

		if (!paymentPlan.client_id) {
			throw new Error("Payment plan has no client associated");
		}

		// Get the assigned coach for this client
		const assignedCoachId = await getClientAssignedCoach(paymentPlan.client_id);

		// Check if this is the first slot in the payment plan
		if (!paymentSlot.plan_id) {
			throw new Error("Payment slot has no plan associated");
		}

		const { data: allSlots, error: allSlotsError } = await supabase
			.from("payment_slots")
			.select("id, due_date, payment_id")
			.eq("plan_id", paymentSlot.plan_id)
			.order("due_date", { ascending: true });

		if (allSlotsError) {
			throw new Error("Failed to fetch payment plan slots");
		}

		const currentSlotIndex = allSlots.findIndex(
			(slot) => slot.id === paymentSlotId,
		);
		const isFirstSlot = currentSlotIndex === 0;

		// Determine start date for the first activity period
		let activityStartDate: Date;

		if (isFirstSlot) {
			// For first slot, use the payment plan start date
			activityStartDate = new Date(paymentPlan.term_start_date);
		} else {
			// For subsequent slots, calculate from previous periods
			// This should start right after the last activity period
			const { data: lastPeriod } = await supabase
				.from("client_activity_period")
				.select("end_date")
				.eq("payment_plan", paymentPlan.id)
				.order("end_date", { ascending: false })
				.limit(1)
				.single();

			if (lastPeriod?.end_date) {
				activityStartDate = new Date(lastPeriod.end_date);
				activityStartDate.setDate(activityStartDate.getDate() + 1);
			} else {
				// Fallback to plan start date if no previous periods found
				activityStartDate = new Date(paymentPlan.term_start_date);
			}
		}

		// Find the next payment slot to determine how many periods to create
		const nextSlotIndex = currentSlotIndex + 1;
		const nextSlot = allSlots[nextSlotIndex];

		// If there's a next slot, create periods until its due date
		// If no next slot, create periods until end of payment plan
		let targetEndDate: Date;
		if (nextSlot) {
			targetEndDate = new Date(nextSlot.due_date);
		} else {
			targetEndDate = new Date(paymentPlan.term_end_date);
		}

		// Create activity periods until we reach the target end date
		const createdPeriods = [];
		let periodStartDate = new Date(activityStartDate);

		while (periodStartDate <= targetEndDate) {
			let periodEndDate: Date;

			if (createdPeriods.length === 0 && isFirstSlot) {
				// First period: end on Saturday at least a week away
				periodEndDate = getNextSaturday(periodStartDate);
			} else {
				// Subsequent periods: exactly 14 days
				periodEndDate = new Date(periodStartDate);
				periodEndDate.setDate(periodStartDate.getDate() + 13); // 13 days later = 14 day period
			}

			// Don't truncate periods - let them run full 14 days
			// The while loop condition handles when to stop creating new periods

			// Create the activity period using the existing action
			const result = await createClientActivityPeriodAction({
				payment_plan: paymentPlan.id,
				payment_slot_id: paymentSlotId,
				coach_id: assignedCoachId,
				start_date: periodStartDate.toISOString().split("T")[0],
				end_date: periodEndDate.toISOString().split("T")[0],
				active: true,
			});

			if (result?.data?.success) {
				createdPeriods.push(result.data.data);
			} else {
				throw new Error("Failed to create activity period");
			}

			// Next period starts the day after this one ends
			periodStartDate = new Date(periodEndDate);
			periodStartDate.setDate(periodStartDate.getDate() + 1);

			// The while loop condition will handle when to stop
		}

		return {
			success: true,
			data: {
				periodsCreated: createdPeriods.length,
				clientName: client.name,
				coachId: assignedCoachId,
				periods: createdPeriods,
			},
		};
	} catch (error) {
		console.error("Error generating activity periods:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to generate activity periods",
		);
	}
}
