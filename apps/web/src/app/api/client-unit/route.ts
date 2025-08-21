import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/serviceRole";

import { z } from "zod";

const requestSchema = z.object({
	client_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { client_id } = requestSchema.parse(body);

		const supabase = await createClient();

		// Get client information with product details
		const { data: client, error: clientError } = await supabase
			.from("clients")
			.select(`
				id, 
				start_date, 
				status,
				product_id,
				products(
					id,
					name,
					client_unit
				)
			`)
			.eq("id", client_id)
			.single();

		if (clientError || !client) {
			return NextResponse.json({ error: "Client not found" }, { status: 404 });
		}

		// Get current coach assignment (if any) - be more flexible with the query
		const { data: assignments } = await supabase
			.from("client_assignments")
			.select("user_id, assignment_type, end_date")
			.eq("client_id", client_id)
			.order("start_date", { ascending: false });

		console.log("All assignments for client:", assignments);

		// Find active coach assignment or any coach assignment
		let coach_assignment = assignments?.find(
			(a) => a.assignment_type === "coach" && a.end_date === null,
		);

		// If no active coach, find the most recent coach assignment
		if (!coach_assignment) {
			coach_assignment = assignments?.find(
				(a) => a.assignment_type === "coach",
			);
		}

		// If still no coach, use any assignment or default
		const coach_id =
			coach_assignment?.user_id ||
			assignments?.[0]?.user_id ||
			"00000000-0000-0000-0000-000000000000"; // Use a valid UUID format

		console.log("Selected coach_id:", coach_id);

		// Get the client unit value from the product, fallback to 1.0 if no product assigned
		// Note: products is an array due to Supabase's relationship structure, so we take the first element
		const product = Array.isArray(client.products)
			? client.products[0]
			: client.products;
		const productClientUnit = product?.client_unit || 1.0;
		console.log(
			"Product client unit:",
			productClientUnit,
			"Product:",
			product?.name,
		);

		// Calculate client units
		const calculatedUnits = await calculateClientUnits(
			supabase,
			client_id,
			client.start_date,
			productClientUnit,
		);

		// Upsert the client units record (insert or update if exists)
		const clientUnitsData = {
			client_id,
			coach_id,
			calculation_date: new Date().toISOString(),
			base_units: calculatedUnits.base_units,
			calculated_units: calculatedUnits.total_units,
			time_since_start_factor: calculatedUnits.time_since_start_factor,
			nps_factor: 0.0, // Always 0 - ignored per requirements
			messages_factor: calculatedUnits.messages_factor,
			escalations_factor: calculatedUnits.escalations_factor,
			subjective_difficulty: calculatedUnits.subjective_difficulty,
			wins_factor: 0.0, // Always 0 - ignored per requirements
		};

		console.log("Upserting client units data:", clientUnitsData);

		// Check if record exists for this client and coach
		const { data: existingRecord } = await supabase
			.from("client_units")
			.select("id")
			.eq("client_id", client_id)
			.eq("coach_id", coach_id)
			.single();

		let result: any;
		if (existingRecord) {
			// Update existing record
			const { data: updatedRecord, error: updateError } = await supabase
				.from("client_units")
				.update(clientUnitsData)
				.eq("id", existingRecord.id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating client units:", updateError);
				return NextResponse.json(
					{ error: "Failed to update client units record" },
					{ status: 500 },
				);
			}
			result = updatedRecord;
			console.log("Successfully updated client units:", result);
		} else {
			// Insert new record
			const { data: insertedRecord, error: insertError } = await supabase
				.from("client_units")
				.insert(clientUnitsData)
				.select()
				.single();

			if (insertError) {
				console.error("Error inserting client units:", insertError);
				return NextResponse.json(
					{ error: "Failed to create client units record" },
					{ status: 500 },
				);
			}
			result = insertedRecord;
			console.log("Successfully inserted client units:", result);
		}

		return NextResponse.json({
			success: true,
			client_id,
			coach_id,
			calculated_units: calculatedUnits,
		});
	} catch (error) {
		console.error("Client units calculation error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.issues },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

async function calculateClientUnits(
	supabase: Awaited<ReturnType<typeof createClient>>,
	client_id: string,
	start_date: string,
	productBaseUnits: number,
) {
	// Start with base units from the product
	const base_units = productBaseUnits;
	let time_since_start_factor = 0.0;
	// NPS factor removed per requirements - should be ignored
	let messages_factor = 0.0;
	let escalations_factor = 0.0;
	const subjective_difficulty = 0.0;
	// Wins factor removed per requirements - should be ignored

	// Calculate time since start (in months)
	const startDate = new Date(start_date);
	const currentDate = new Date();
	const monthsSinceStart = Math.floor(
		(currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
	);

	// Apply onboarding multipliers
	if (monthsSinceStart === 0) {
		time_since_start_factor = 0.5; // First month: +0.5 units (1.5 total)
	} else if (monthsSinceStart === 1) {
		time_since_start_factor = 0.2; // Second month: +0.2 units (1.2 total)
	}

	// Count onboarding tasks
	const { data: onboardingTasks } = await supabase
		.from("client_onboarding_progress")
		.select("id")
		.eq("client_id", client_id);

	const onboardingTasksCount = onboardingTasks?.length || 0;
	const onboarding_factor = onboardingTasksCount * 0.25;

	// Count tickets opened for this client
	const { data: tickets } = await supabase
		.from("tickets")
		.select("id, ticket_type")
		.eq("client_id", client_id);

	const ticketsCount = tickets?.length || 0;
	const escalationTickets =
		tickets?.filter(
			(t: { ticket_type: string }) => t.ticket_type === "escalation",
		).length || 0;

	escalations_factor = ticketsCount * 0.1; // 0.1 per ticket
	escalations_factor += escalationTickets * 0.1; // Additional 0.1 for escalations

	// Count coach assignment changes
	const { data: assignments } = await supabase
		.from("client_assignments")
		.select("id")
		.eq("client_id", client_id)
		.eq("assignment_type", "coach");

	const coachChanges = Math.max(0, (assignments?.length || 1) - 1); // Subtract 1 for initial assignment
	const coach_change_factor = coachChanges * 0.1;

	// NPS score calculation removed - per requirements, NPS should be ignored

	// Get message activity last 30 days
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const { data: recentActivity } = await supabase
		.from("client_activity")
		.select("messages_sent")
		.eq("client_id", client_id)
		.gte("activity_date", thirtyDaysAgo.toISOString())
		.single();

	const messagesSent = recentActivity?.messages_sent || 0;
	// High message activity might indicate more coaching needed
	if (messagesSent > 100) {
		messages_factor = 0.3;
	} else if (messagesSent > 50) {
		messages_factor = 0.2;
	} else if (messagesSent > 20) {
		messages_factor = 0.1;
	}

	// Wins calculation removed - per requirements, wins should be ignored

	// Calculate total units
	const total_units =
		base_units +
		time_since_start_factor +
		onboarding_factor +
		messages_factor +
		escalations_factor +
		coach_change_factor +
		subjective_difficulty;

	return {
		base_units,
		time_since_start_factor,
		nps_factor: 0.0, // Always 0 - ignored per requirements
		messages_factor,
		escalations_factor,
		subjective_difficulty,
		wins_factor: 0.0, // Always 0 - ignored per requirements
		onboarding_factor,
		coach_change_factor,
		total_units: Math.max(0.1, total_units), // Minimum 0.1 units
	};
}
