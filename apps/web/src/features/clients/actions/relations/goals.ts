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

export async function updateClientGoal(
	goalId: string,
	goalData: Partial<ClientGoal>,
) {
	const supabase = await createClient();
	const user = await getUser();
	console.log("Updating goal", goalId, goalData);

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("client_goals")
		.update({
			...goalData,
			updated_by: user.user.id,
			updated_at: new Date().toISOString(),
		})
		.eq("id", goalId);

	if (error) {
		throw new Error(`Failed to update goal: ${error.message}`);
	}

	return { success: true };
}

export async function deleteClientGoal(goalId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("client_goals")
		.delete()
		.eq("id", goalId);

	if (error) {
		throw new Error(`Failed to delete goal: ${error.message}`);
	}

	return { success: true };
}

export async function createClientGoal(
	clientId: string,
	goalData: Omit<ClientGoal, "id">,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_goals")
		.insert({
			client_id: clientId,
			...goalData,
			created_by: user.user.id,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create goal: ${error.message}`);
	}

	return { success: true, data };
}
