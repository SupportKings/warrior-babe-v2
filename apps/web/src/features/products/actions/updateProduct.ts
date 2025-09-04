"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { productUpdateSchema } from "@/features/products/types/products";

import { returnValidationErrors } from "next-safe-action";

export const updateProductAction = actionClient
	.inputSchema(productUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if product exists
			const { data: existingProduct, error: fetchError } = await supabase
				.from("products")
				.select("id, name")
				.eq("id", id)
				.single();

			if (fetchError || !existingProduct) {
				return returnValidationErrors(productUpdateSchema, {
					_errors: ["Product not found"],
				});
			}

			// 2. If name is being updated, check for conflicts
			if (updateData.name && updateData.name !== existingProduct.name) {
				const { data: nameConflict } = await supabase
					.from("products")
					.select("id")
					.eq("name", updateData.name)
					.neq("id", id)
					.single();

				if (nameConflict) {
					return returnValidationErrors(productUpdateSchema, {
						name: {
							_errors: ["Product with this name already exists"],
						},
					});
				}
			}

			// 3. Prepare update data (remove undefined values)
			const cleanUpdateData: any = {};

			if (updateData.name !== undefined) cleanUpdateData.name = updateData.name;
			if (updateData.description !== undefined) {
				cleanUpdateData.description = updateData.description;
			}
			if (updateData.default_duration_months !== undefined) {
				cleanUpdateData.default_duration_months =
					updateData.default_duration_months;
			}
			if (updateData.is_active !== undefined) {
				cleanUpdateData.is_active = updateData.is_active;
			}

			// 4. Update the product record
			const { data: updatedProduct, error: updateError } = await supabase
				.from("products")
				.update({
					...cleanUpdateData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating product:", updateError);
				return returnValidationErrors(productUpdateSchema, {
					_errors: ["Failed to update product. Please try again."],
				});
			}

			if (!updatedProduct) {
				return returnValidationErrors(productUpdateSchema, {
					_errors: ["Product update failed. Please try again."],
				});
			}

			// 5. Revalidate relevant paths
			revalidatePath("/dashboard/system-config/products");
			revalidatePath(`/dashboard/system-config/products/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Product updated successfully",
					product: {
						id: updatedProduct.id,
						name: updatedProduct.name,
						description: updatedProduct.description,
						default_duration_months: updatedProduct.default_duration_months,
						is_active: updatedProduct.is_active,
					},
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateProduct:", error);

			return returnValidationErrors(productUpdateSchema, {
				_errors: ["Failed to update product. Please try again."],
			});
		}
	});
