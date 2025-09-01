"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

interface ClientNPS {
	id?: string;
	nps_score: number;
	notes: string;
	recorded_date: string;
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
			console.log("Updated NPS score", nps);
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

export async function updateClientNPSScore(
	npsId: string,
	npsData: Partial<ClientNPS>,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("client_nps")
		.update({
			...npsData,
			recorded_by: user.user.id,
		})
		.eq("id", npsId);

	if (error) {
		throw new Error(`Failed to update NPS score: ${error.message}`);
	}

	return { success: true };
}

export async function deleteClientNPSScore(npsId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase.from("client_nps").delete().eq("id", npsId);

	if (error) {
		throw new Error(`Failed to delete NPS score: ${error.message}`);
	}

	return { success: true };
}

export async function createClientNPSScore(
	clientId: string,
	npsData: Omit<ClientNPS, "id">,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("client_nps")
		.insert({
			provided_by: clientId,
			...npsData,
			recorded_by: user.user.id,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create NPS score: ${error.message}`);
	}

	return { success: true, data };
}
