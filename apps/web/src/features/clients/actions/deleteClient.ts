import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/client";

import { z } from "zod";

const schema = z.object({
	id: z.string().uuid(),
});

export const deleteClient = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const supabase = createClient();

		const { error } = await supabase
			.from("clients")
			.update({
				is_deleted: true,
				updated_at: new Date().toISOString(),
			})
			.eq("id", parsedInput.id);

		if (error) {
			throw new Error(`Failed to delete client: ${error.message}`);
		}

		return { success: true };
	});
