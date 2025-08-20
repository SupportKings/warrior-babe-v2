"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const productUpdateSchema = z.object({
	id: z.string().uuid(),
	client_unit: z.number().min(0.1).max(10),
});

const schema = z.object({
	products: z.array(productUpdateSchema).min(1),
});

export const updateProductUnits = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();
		
		try {
			// Update each product's client_unit value
			const updates = await Promise.all(
				parsedInput.products.map(async (product: { id: string; client_unit: number }) => {
					const { data, error } = await supabase
						.from("products")
						.update({ client_unit: product.client_unit })
						.eq("id", product.id)
						.select("id, name, client_unit")
						.single();

					if (error) {
						console.error(`Error updating product ${product.id}:`, error);
						throw new Error(`Failed to update product: ${error.message}`);
					}

					return data;
				})
			);

			return {
				success: true,
				updated_products: updates,
				message: `Successfully updated ${updates.length} product(s)`,
			};
		} catch (error) {
			console.error("Error updating product units:", error);
			throw new Error(
				error instanceof Error 
					? error.message 
					: "Failed to update product units"
			);
		}
	});
