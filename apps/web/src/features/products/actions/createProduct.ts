"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { productWithPaymentPlanFormSchema } from "@/features/products/types/products";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";

export const createProductAction = actionClient
	.inputSchema(productWithPaymentPlanFormSchema)
	.action(async ({ parsedInput }) => {
		const {
			name,
			description,
			default_duration_months,
			client_unit,
			is_active,
			payment_plan_templates,
		} = parsedInput;

		try {
			const supabase = await createClient();
			const user = await getUser();

			if (!user) {
				return returnValidationErrors(productWithPaymentPlanFormSchema, {
					_errors: ["Authentication required. Please sign in."],
				});
			}

			// 1. Check if product with this name already exists
			const { data: existingProduct } = await supabase
				.from("products")
				.select("id")
				.eq("name", name)
				.single();

			if (existingProduct) {
				return returnValidationErrors(productWithPaymentPlanFormSchema, {
					name: {
						_errors: ["Product with this name already exists"],
					},
				});
			}

			// 2. Create the product record
			const { data: newProduct, error: productError } = await supabase
				.from("products")
				.insert({
					name,
					description: description || null,
					default_duration_months: default_duration_months || 0,
					client_unit: client_unit || 0,
					is_active: is_active ?? true,
				})
				.select()
				.single();

			if (productError) {
				console.error("Error creating product:", productError);
				return returnValidationErrors(productWithPaymentPlanFormSchema, {
					_errors: ["Failed to create product. Please try again."],
				});
			}

			if (!newProduct) {
				return returnValidationErrors(productWithPaymentPlanFormSchema, {
					_errors: ["Product creation failed. Please try again."],
				});
			}

			// 3. Create payment plan templates if provided
			const createdPaymentPlanTemplates = [];
			if (payment_plan_templates && payment_plan_templates.length > 0) {
				for (const template of payment_plan_templates) {
					// Create the payment plan template
					const { data: newTemplate, error: templateError } = await supabase
						.from("payment_plan_templates")
						.insert({
							name: template.name,
							product_id: newProduct.id,
							program_length_months: template.program_length_months,
						})
						.select()
						.single();

					if (templateError) {
						console.error("Error creating payment plan template:", templateError);
						return returnValidationErrors(productWithPaymentPlanFormSchema, {
							payment_plan_templates: {
								_errors: ["Failed to create payment plan template. Please try again."],
							},
						});
					}

					if (!newTemplate) {
						return returnValidationErrors(productWithPaymentPlanFormSchema, {
							payment_plan_templates: {
								_errors: ["Payment plan template creation failed. Please try again."],
							},
						});
					}

					// Create payment plan template slots
					const templateSlots = template.slots.map(slot => ({
						payment_plan_template_id: newTemplate.id,
						amount_due: slot.amount_due,
						months_to_delay: slot.months_to_delay,
					}));

					const { error: slotsError } = await supabase
						.from("payment_plan_template_slots")
						.insert(templateSlots);

					if (slotsError) {
						console.error("Error creating payment plan template slots:", slotsError);
						return returnValidationErrors(productWithPaymentPlanFormSchema, {
							payment_plan_templates: {
								_errors: ["Failed to create payment plan template slots. Please try again."],
							},
						});
					}

					createdPaymentPlanTemplates.push({
						...newTemplate,
						slots: templateSlots,
					});
				}
			}

			// 4. Revalidate relevant paths
			revalidatePath("/dashboard/products");
			revalidatePath("/dashboard/system-config/products");
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Product created successfully",
					product: {
						id: newProduct.id,
						name: newProduct.name,
						description: newProduct.description,
						default_duration_months: newProduct.default_duration_months,
						client_unit: newProduct.client_unit,
						is_active: newProduct.is_active,
						payment_plan_templates: createdPaymentPlanTemplates,
					},
				},
			};
		} catch (error) {
			console.error("Unexpected error in createProduct:", error);

			return returnValidationErrors(productWithPaymentPlanFormSchema, {
				_errors: ["Failed to create product. Please try again."],
			});
		}
	});
