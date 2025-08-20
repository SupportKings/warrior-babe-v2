"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";

export async function updateChecklistProgress(input: {
	progressId: string;
	isCompleted: boolean;
	notes?: string;
}) {
	console.log("updateChecklistProgress called with input:", input);
	
	const session = await getUser();
	if (!session?.user) {
		console.error("No user session found");
		throw new Error("Unauthorized");
	}

	const supabase = await createClient();

	const updateData: any = {
		is_completed: input.isCompleted,
	};

	if (input.isCompleted) {
		updateData.completed_at = new Date().toISOString();
		updateData.completed_by = session.user.id;
	} else {
		updateData.completed_at = null;
		updateData.completed_by = null;
	}

	if (input.notes !== undefined) {
		updateData.notes = input.notes;
	}

	console.log("Updating client_onboarding_progress with data:", updateData);
	console.log("Progress ID:", input.progressId);

	const { data, error } = await supabase
		.from("client_onboarding_progress")
		.update(updateData)
		.eq("id", input.progressId)
		.select()
		.single();

	if (error) {
		console.error("Supabase error updating checklist progress:", error);
		throw new Error(`Failed to update checklist progress: ${error.message}`);
	}

	console.log("Successfully updated checklist progress:", data);
	return { success: true, data };
}