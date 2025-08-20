"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";

export async function deleteTemplates(ids: string[]) {
	const session = await getUser();
	if (!session?.user) {
		throw new Error("Unauthorized");
	}

	if (ids.length === 0) {
		return { success: true };
	}

	const supabase = await createClient();

	const { error } = await supabase
		.from("checklist_templates")
		.delete()
		.in("id", ids);

	if (error) {
		console.error("Delete error:", error);
		throw new Error(`Failed to delete templates: ${error.message}`);
	}

	return { success: true };
}