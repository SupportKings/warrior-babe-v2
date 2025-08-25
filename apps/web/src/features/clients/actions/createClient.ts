"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { clientCreateSchema } from "@/features/clients/types/client";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";

export const createClientAction = actionClient
	.inputSchema(clientCreateSchema)
	.action(async ({ parsedInput }) => {
		const {
			name,
			email,
			phone,
			overall_status,
			everfit_access,
			team_ids,
			onboarding_call_completed,
			two_week_check_in_call_completed,
			vip_terms_signed,
			onboarding_notes,
			onboarding_completed_date,
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
					name,
					email,
					phone,
					overall_status: overall_status || "new",
					everfit_access: everfit_access || "new",
					team_ids: team_ids || null,
					onboarding_call_completed: onboarding_call_completed || false,
					two_week_check_in_call_completed:
						two_week_check_in_call_completed || false,
					vip_terms_signed: vip_terms_signed || false,
					onboarding_notes: onboarding_notes || null,
					onboarding_completed_date: onboarding_completed_date || null,
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
						name: newClient.name,
						email: newClient.email,
						phone: newClient.phone,
						overall_status: newClient.overall_status,
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
