"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import {
	clientCreateSchema,
	formatValidationError,
} from "@/features/clients/types/client";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";

export const createClientAction = actionClient
	.inputSchema(clientCreateSchema)
	.action(async ({ parsedInput }) => {
		const {
			first_name,
			last_name,
			email,
			phone,
			start_date,
			end_date,
			renewal_date,
			product_id,
			status,
			platform_access_status,
			platform_link,
			consultation_form_completed,
			vip_terms_signed,
			onboarding_notes,
		} = parsedInput;

		try {
			const supabase = await createClient();
			const user = await getUser();

			if (!user) {
				return returnValidationErrors(clientCreateSchema, {
					_errors: ["Authentication required. Please sign in."],
				});
			}

			// 1. Check if client with this email already exists
			const { data: existingClient } = await supabase
				.from("clients")
				.select("id")
				.eq("email", email)
				.single();

			if (existingClient) {
				return returnValidationErrors(clientCreateSchema, {
					email: {
						_errors: ["Client with this email already exists"],
					},
				});
			}

			// 2. Create the client record
			const { data: newClient, error: clientError } = await supabase
				.from("clients")
				.insert({
					first_name,
					last_name,
					email,
					phone,
					start_date,
					end_date: end_date || null,
					renewal_date: renewal_date || null,
					product_id: product_id || null,
					created_by: user.session.userId,
					status: status || "active",
					platform_access_status: platform_access_status || "pending",
					platform_link: platform_link || null,
					consultation_form_completed: consultation_form_completed || false,
					vip_terms_signed: vip_terms_signed || false,
					onboarding_notes: onboarding_notes || null,
				})
				.select()
				.single();

			if (clientError) {
				console.error("Error creating client:", clientError);
				return returnValidationErrors(clientCreateSchema, {
					_errors: ["Failed to create client. Please try again."],
				});
			}

			if (!newClient) {
				return returnValidationErrors(clientCreateSchema, {
					_errors: ["Client creation failed. Please try again."],
				});
			}

			// 3. Revalidate relevant paths
			revalidatePath("/dashboard/clients");
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Client created successfully",
					client: {
						id: newClient.id,
						first_name: newClient.first_name,
						last_name: newClient.last_name,
						email: newClient.email,
						phone: newClient.phone,
						start_date: newClient.start_date,
						status: newClient.status,
					},
				},
			};
		} catch (error) {
			console.error("Unexpected error in createClient:", error);

			return returnValidationErrors(clientCreateSchema, {
				_errors: ["Failed to create client. Please try again."],
			});
		}
	});
