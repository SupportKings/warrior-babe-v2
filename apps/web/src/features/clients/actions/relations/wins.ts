"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

interface ClientWin {
	id?: string;
	title: string;
	description?: string | null;
	win_date: string;
	tag_ids?: string[];
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

export async function updateClientWin(
	winId: string,
	winData: Partial<ClientWin>,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Extract tag_ids from winData to handle separately
	const { tag_ids, ...cleanWinData } = winData;

	// Update the win data (excluding tag_ids)
	const { error } = await supabase
		.from("client_wins")
		.update(cleanWinData)
		.eq("id", winId);

	if (error) {
		throw new Error(`Failed to update win: ${error.message}`);
	}

	// Update tags if provided
	if (tag_ids !== undefined) {
		// First, delete all existing tags for this win
		await supabase
			.from("client_win_tags")
			.delete()
			.eq("win_id", winId);

		// Then, create new tag entries if any
		if (tag_ids.length > 0) {
			const tagEntries = tag_ids.map(tagId => ({
				win_id: winId,
				tag_id: tagId,
			}));

			const { error: tagError } = await supabase
				.from("client_win_tags")
				.insert(tagEntries);

			if (tagError) {
				throw new Error(`Failed to update win tags: ${tagError.message}`);
			}
		}
	}

	return { success: true };
}

export async function deleteClientWin(winId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase.from("client_wins").delete().eq("id", winId);

	if (error) {
		throw new Error(`Failed to delete win: ${error.message}`);
	}

	return { success: true };
}

export async function createClientWin(
	clientId: string,
	winData: Omit<ClientWin, "id">,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Extract tag_ids from winData to handle separately
	const { tag_ids, ...cleanWinData } = winData;

	const { data, error } = await supabase
		.from("client_wins")
		.insert({
			client_id: clientId,
			...cleanWinData,
			recorded_by: user.user.id,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create win: ${error.message}`);
	}

	// Create client_win_tags entries if tag_ids are provided
	if (tag_ids && tag_ids.length > 0 && data) {
		const tagEntries = tag_ids.map(tagId => ({
			win_id: data.id,
			tag_id: tagId,
		}));

		const { error: tagError } = await supabase
			.from("client_win_tags")
			.insert(tagEntries);

		if (tagError) {
			// If tag creation fails, we should probably delete the win to maintain consistency
			await supabase.from("client_wins").delete().eq("id", data.id);
			throw new Error(`Failed to create win tags: ${tagError.message}`);
		}
	}

	return { success: true, data };
}
