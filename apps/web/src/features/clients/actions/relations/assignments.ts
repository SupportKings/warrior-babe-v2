"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

interface ClientAssignment {
	id?: string;
	coach_id: string | null;
	start_date: string;
	end_date: string | null;
	assignment_type: string;
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
					coach_id: assignment.coach_id,
					start_date: assignment.start_date,
					end_date:
						assignment.end_date?.trim && assignment.end_date.trim() === ""
							? null
							: assignment.end_date,
					assignment_type: assignment.assignment_type,
				})
				.eq("id", assignment.id);
		} else {
			// Create new
			await supabase.from("client_assignments").insert({
				client_id: clientId,
				coach_id: assignment.coach_id,
				start_date: assignment.start_date,
				end_date:
					assignment.end_date?.trim && assignment.end_date.trim() === ""
						? null
						: assignment.end_date,
				assignment_type: assignment.assignment_type,
				assigned_by: user.user.id,
			});
		}
	}

	return { success: true };
}

export async function updateClientAssignment(
	assignmentId: string,
	assignmentData: Partial<ClientAssignment>,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Prepare the update data, converting empty strings to null
	const updateData = {
		...assignmentData,
		end_date: assignmentData.end_date?.trim() === "" ? null : assignmentData.end_date,
	};

	const { error } = await supabase
		.from("client_assignments")
		.update(updateData)
		.eq("id", assignmentId);

	if (error) {
		throw new Error(`Failed to update assignment: ${error.message}`);
	}

	return { success: true };
}

export async function deleteClientAssignment(assignmentId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("client_assignments")
		.delete()
		.eq("id", assignmentId);

	if (error) {
		throw new Error(`Failed to delete assignment: ${error.message}`);
	}

	return { success: true };
}

export async function createClientAssignment(
	clientId: string,
	assignmentData: Omit<ClientAssignment, "id">,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_assignments")
		.insert({
			client_id: clientId,
			coach_id: assignmentData.coach_id,
			start_date: assignmentData.start_date,
			end_date:
				assignmentData.end_date?.trim() === "" ? null : assignmentData.end_date,
			assignment_type: assignmentData.assignment_type,
			assigned_by: user.user.id,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create assignment: ${error.message}`);
	}

	return { success: true, data };
}
