"use server";

import { createClient } from "@/utils/supabase/server";
import { getClientAssignedCoach } from "../../clients/actions/relations/getClientAssignedCoach";

/**
 * Detect payment plans that need grace periods and create them
 * 
 * Logic:
 * - Find payment plans where term_end_date > today (active plans)
 * - Get the last activity period for each plan
 * - If last activity period end_date < today AND no grace period exists for this gap
 * - Create one 14-day grace period starting day after last period ends
 */
export async function detectAndCreateGracePeriods() {
	const supabase = await createClient();
	const today = new Date().toISOString().split("T")[0];

	try {
		console.log("🔍 Starting grace period detection...");

		// Get all active payment plans (not yet ended)
		const { data: activePaymentPlans, error: plansError } = await supabase
			.from("payment_plans")
			.select(`
				id,
				client_id,
				term_start_date,
				term_end_date,
				clients!inner(
					id,
					name
				)
			`)
			.gt("term_end_date", today)
			.not("client_id", "is", null);

		if (plansError) {
			console.error("❌ Error fetching active payment plans:", plansError);
			throw new Error(`Failed to fetch payment plans: ${plansError.message}`);
		}

		if (!activePaymentPlans || activePaymentPlans.length === 0) {
			console.log("ℹ️ No active payment plans found");
			return {
				success: true,
				data: {
					plansChecked: 0,
					gracePeriodsCreated: 0,
					results: [],
				},
			};
		}

		console.log(`📋 Found ${activePaymentPlans.length} active payment plans to check`);

		const results = [];

		for (const plan of activePaymentPlans) {
			try {
				console.log(`🔍 Checking plan ${plan.id} for client: ${plan.clients.name}`);

				// Get the last activity period for this payment plan
				const { data: lastPeriod, error: lastPeriodError } = await supabase
					.from("client_activity_period")
					.select("id, end_date, is_grace")
					.eq("payment_plan", plan.id)
					.order("end_date", { ascending: false })
					.limit(1)
					.single();

				if (lastPeriodError && lastPeriodError.code !== "PGRST116") {
					console.error(`❌ Error fetching last period for plan ${plan.id}:`, lastPeriodError);
					continue;
				}

				// If no activity periods exist yet, skip (normal generation will handle this)
				if (!lastPeriod) {
					console.log(`⏭️ No activity periods found for plan ${plan.id}, skipping`);
					results.push({
						planId: plan.id,
						clientName: plan.clients.name,
						action: "skipped",
						reason: "No activity periods exist yet",
					});
					continue;
				}

				// Check if the last period has ended and we need a grace period
				const lastPeriodEndDate = new Date(lastPeriod.end_date || "");
				const todayDate = new Date(today);

				if (lastPeriodEndDate >= todayDate) {
					console.log(`✅ Plan ${plan.id} is current (ends ${lastPeriod.end_date})`);
					results.push({
						planId: plan.id,
						clientName: plan.clients.name,
						action: "current",
						reason: `Current period ends ${lastPeriod.end_date}`,
					});
					continue;
				}

				// Check if a grace period already exists after the last period
				const dayAfterLastPeriod = new Date(lastPeriodEndDate);
				dayAfterLastPeriod.setDate(dayAfterLastPeriod.getDate() + 1);

				const { data: existingGracePeriods, error: graceCheckError } = await supabase
					.from("client_activity_period")
					.select("id")
					.eq("payment_plan", plan.id)
					.eq("is_grace", true)
					.gte("start_date", dayAfterLastPeriod.toISOString().split("T")[0])
					.limit(1);

				if (graceCheckError) {
					console.error(`❌ Error checking existing grace periods for plan ${plan.id}:`, graceCheckError);
					continue;
				}

				if (existingGracePeriods && existingGracePeriods.length > 0) {
					console.log(`⏭️ Grace period already exists for plan ${plan.id}`);
					results.push({
						planId: plan.id,
						clientName: plan.clients.name,
						action: "exists",
						reason: "Grace period already exists",
					});
					continue;
				}

				// We need to create a grace period
				console.log(`🚨 Plan ${plan.id} needs a grace period (last period ended ${lastPeriod.end_date})`);

				// Get the assigned coach for this client
				const assignedCoachId = await getClientAssignedCoach(plan.client_id || "");

				if (!assignedCoachId) {
					console.error(`❌ No assigned coach found for client: ${plan.clients.name}`);
					results.push({
						planId: plan.id,
						clientName: plan.clients.name,
						action: "error",
						reason: "No assigned coach found",
					});
					continue;
				}

				// Create 14-day grace period starting the day after the last period ended
				const gracePeriodStart = new Date(lastPeriodEndDate);
				gracePeriodStart.setDate(gracePeriodStart.getDate() + 1);

				const gracePeriodEnd = new Date(gracePeriodStart);
				gracePeriodEnd.setDate(gracePeriodStart.getDate() + 13); // 14 days total

				console.log(`⭐ Creating grace period: ${gracePeriodStart.toISOString().split("T")[0]} to ${gracePeriodEnd.toISOString().split("T")[0]}`);

				// Create the grace period using existing action but with is_grace flag
				// Note: We'll need to modify createClientActivityPeriodAction to support is_grace
				const result = await createGracePeriodActivityPeriod({
					payment_plan: plan.id,
					payment_slot_id: null, // No payment slot for grace periods
					coach_id: assignedCoachId,
					start_date: gracePeriodStart.toISOString().split("T")[0],
					end_date: gracePeriodEnd.toISOString().split("T")[0],
					active: true,
					is_grace: true,
				});

				if (result?.data?.success) {
					console.log(`✅ Grace period created successfully for plan ${plan.id}`);
					results.push({
						planId: plan.id,
						clientName: plan.clients.name,
						action: "created",
						reason: `Grace period created: ${gracePeriodStart.toISOString().split("T")[0]} to ${gracePeriodEnd.toISOString().split("T")[0]}`,
						gracePeriodId: result.data.data?.id,
					});
				} else {
					console.error(`❌ Failed to create grace period for plan ${plan.id}:`, result);
					results.push({
						planId: plan.id,
						clientName: plan.clients.name,
						action: "error",
						reason: `Failed to create grace period: ${result?.data?.message || "Unknown error"}`,
					});
				}

			} catch (error) {
				console.error(`❌ Error processing plan ${plan.id}:`, error);
				results.push({
					planId: plan.id,
					clientName: plan.clients?.name || "Unknown",
					action: "error",
					reason: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		const gracePeriodsCreated = results.filter(r => r.action === "created").length;
		
		console.log(`🎉 Grace period detection completed:`);
		console.log(`   📊 Plans checked: ${activePaymentPlans.length}`);
		console.log(`   ⭐ Grace periods created: ${gracePeriodsCreated}`);

		return {
			success: true,
			data: {
				plansChecked: activePaymentPlans.length,
				gracePeriodsCreated,
				results,
			},
		};

	} catch (error) {
		console.error("❌ Error in detectAndCreateGracePeriods:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to detect and create grace periods",
		);
	}
}

/**
 * Create a grace period activity period (separate from regular creation)
 */
async function createGracePeriodActivityPeriod(data: {
	payment_plan: string;
	payment_slot_id: string | null;
	coach_id: string;
	start_date: string;
	end_date: string;
	active: boolean;
	is_grace: boolean;
}) {
	const supabase = await createClient();

	try {
		const { data: result, error } = await supabase
			.from("client_activity_period")
			.insert({
				payment_plan: data.payment_plan,
				payment_slot: data.payment_slot_id,
				coach_id: data.coach_id,
				start_date: data.start_date,
				end_date: data.end_date,
				active: data.active,
				is_grace: data.is_grace,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Database error: ${error.message}`);
		}

		return {
			success: true,
			data: {
				success: true,
				data: result,
				message: "Grace period activity period created successfully",
			},
		};
	} catch (error) {
		console.error("Error creating grace period:", error);
		return {
			success: false,
			data: {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create grace period",
			},
		};
	}
}