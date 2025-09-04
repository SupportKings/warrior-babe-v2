"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { clientUpdateSchema } from "@/features/clients/types/client";

import { returnValidationErrors } from "next-safe-action";

export const updateClientAction = actionClient
	.inputSchema(clientUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if client exists
			const { data: existingClient, error: fetchError } = await supabase
				.from("clients")
				.select("id, email")
				.eq("id", id)
				.single();

			if (fetchError || !existingClient) {
				return returnValidationErrors(clientUpdateSchema, {
					_errors: ["Client not found"],
				});
			}

			// 2. If email is being updated, check for conflicts
			if (updateData.email && updateData.email !== existingClient.email) {
				const { data: emailConflict } = await supabase
					.from("clients")
					.select("id")
					.eq("email", updateData.email)
					.neq("id", id)
					.single();

				if (emailConflict) {
					return returnValidationErrors(clientUpdateSchema, {
						email: {
							_errors: ["Client with this email already exists"],
						},
					});
				}
			}

			// 3. Prepare update data (remove undefined values and map to database field names)
			const cleanUpdateData: any = {};

			// Map camelCase to snake_case and handle data transformations
			if (updateData.name !== undefined) cleanUpdateData.name = updateData.name;
			if (updateData.email !== undefined)
				cleanUpdateData.email = updateData.email;
			if (updateData.phone !== undefined) {
				cleanUpdateData.phone = updateData.phone;
			}
			if (updateData.overallStatus !== undefined) {
				cleanUpdateData.overall_status = updateData.overallStatus;
			}
			if (updateData.everfitAccess !== undefined) {
				cleanUpdateData.everfit_access = updateData.everfitAccess;
			}
			if (updateData.onboardingCallCompleted !== undefined) {
				cleanUpdateData.onboarding_call_completed =
					updateData.onboardingCallCompleted;
			}
			if (updateData.twoWeekCheckInCallCompleted !== undefined) {
				cleanUpdateData.two_week_check_in_call_completed =
					updateData.twoWeekCheckInCallCompleted;
			}
			if (updateData.vipTermsSigned !== undefined) {
				cleanUpdateData.vip_terms_signed = updateData.vipTermsSigned;
			}
			if (updateData.onboardingNotes !== undefined) {
				cleanUpdateData.onboarding_notes =
					updateData.onboardingNotes === "" ? null : updateData.onboardingNotes;
			}
			if (updateData.onboardingCompletedDate !== undefined) {
				cleanUpdateData.onboarding_completed_date =
					updateData.onboardingCompletedDate === ""
						? null
						: updateData.onboardingCompletedDate;
			}
			if (updateData.offboardDate !== undefined) {
				cleanUpdateData.offboard_date =
					updateData.offboardDate === "" ? null : updateData.offboardDate;
			}

			// 4. Update the client record
			const { data: updatedClient, error: updateError } = await supabase
				.from("clients")
				.update({
					...cleanUpdateData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating client:", updateError);
				return returnValidationErrors(clientUpdateSchema, {
					_errors: ["Failed to update client. Please try again."],
				});
			}

			if (!updatedClient) {
				return returnValidationErrors(clientUpdateSchema, {
					_errors: ["Client update failed. Please try again."],
				});
			}

			// 5. Revalidate relevant paths
			revalidatePath("/dashboard/clients");
			revalidatePath(`/dashboard/clients/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Client updated successfully",
					client: {
						id: updatedClient.id,
						name: updatedClient.name,
						email: updatedClient.email,
						phone: updatedClient.phone,
						overall_status: updatedClient.overall_status,
					},
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateClient:", error);

			return returnValidationErrors(clientUpdateSchema, {
				_errors: ["Failed to update client. Please try again."],
			});
		}
	});
