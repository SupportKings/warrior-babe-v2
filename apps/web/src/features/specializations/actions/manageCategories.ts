"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

// Schema for creating a category
const createCategorySchema = z.object({
	name: z.string().min(1, "Category name is required").max(100),
	description: z.string().max(500).optional(),
});

// Schema for updating a category
const updateCategorySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, "Category name is required").max(100),
	description: z.string().max(500).optional(),
	is_active: z.boolean(),
});

// Schema for deleting a category
const deleteCategorySchema = z.object({
	id: z.string().uuid(),
});

// Create specialization category
export const createSpecializationCategory = actionClient
	.inputSchema(createCategorySchema)
	.outputSchema(
		z.object({
			success: z.boolean(),
			data: z
				.object({
					id: z.string(),
					name: z.string(),
					description: z.string().nullable().optional(),
					is_active: z.boolean().nullable().optional(),
				})
				.optional(),
		}),
	)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("specialization_categories")
			.insert({
				name: parsedInput.name,
				description: parsedInput.description || null,
			})
			.select()
			.single();

		if (error) {
			throw new Error(error.message);
		}

		return {
			success: true,
			data,
		};
	});

// Update specialization category
export const updateSpecializationCategory = actionClient
	.inputSchema(updateCategorySchema)
	.outputSchema(
		z.object({
			success: z.boolean(),
			data: z
				.object({
					id: z.string(),
					name: z.string(),
					description: z.string().nullable().optional(),
					is_active: z.boolean().nullable().optional(),
				})
				.optional(),
		}),
	)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("specialization_categories")
			.update({
				name: parsedInput.name,
				description: parsedInput.description || null,
				is_active: parsedInput.is_active,
			})
			.eq("id", parsedInput.id)
			.select()
			.single();

		if (error) {
			throw new Error(error.message);
		}

		return {
			success: true,
			data,
		};
	});

// Delete specialization category
export const deleteSpecializationCategory = actionClient
	.inputSchema(deleteCategorySchema)
	.outputSchema(
		z.object({
			success: z.boolean(),
		}),
	)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { error } = await supabase
			.from("specialization_categories")
			.delete()
			.eq("id", parsedInput.id);

		if (error) {
			throw new Error(error.message);
		}

		return {
			success: true,
		};
	});
