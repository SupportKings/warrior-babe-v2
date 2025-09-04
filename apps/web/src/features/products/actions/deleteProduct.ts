"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const deleteProductSchema = z.object({
	id: z.string().uuid("Invalid product ID format"),
});

export const deleteProduct = actionClient
	.inputSchema(deleteProductSchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if product exists
			const { data: existingProduct, error: fetchError } = await supabase
				.from("products")
				.select("id, name")
				.eq("id", id)
				.single();

			if (fetchError || !existingProduct) {
				return returnValidationErrors(deleteProductSchema, {
					_errors: ["Product not found"],
				});
			}

			// 4. Delete the product
			const { error: deleteError } = await supabase
				.from("products")
				.delete()
				.eq("id", id);

			if (deleteError) {
				console.error("Error deleting product:", deleteError);
				return returnValidationErrors(deleteProductSchema, {
					_errors: ["Failed to delete product. Please try again."],
				});
			}

			// 5. Revalidate relevant paths
			revalidatePath("/dashboard/system-config/products");
			revalidatePath(`/dashboard/system-config/products/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Product deleted successfully",
					productName: existingProduct.name,
				},
			};
		} catch (error) {
			console.error("Unexpected error in deleteProduct:", error);

			return returnValidationErrors(deleteProductSchema, {
				_errors: ["Failed to delete product. Please try again."],
			});
		}
	});
