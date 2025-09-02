"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { returnValidationErrors } from "next-safe-action";

const activityPeriodUpdateSchema = z.object({
	id: z.string().uuid(),
	start_date: z.string().optional(),
	end_date: z.string().nullable().optional(),
	active: z.boolean().optional(),
	coach_id: z.string().uuid().nullable().optional(),
	coach_payment: z.string().uuid().nullable().optional(),
	payment_plan: z.string().uuid().nullable().optional(),
});

export const updateActivityPeriodAction = actionClient
	.inputSchema(activityPeriodUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if activity period exists
			const { data: existingPeriod, error: fetchError } = await supabase
				.from("client_activity_period")
				.select("id")
				.eq("id", id)
				.single();

			if (fetchError || !existingPeriod) {
				return returnValidationErrors(activityPeriodUpdateSchema, {
					_errors: ["Activity period not found"],
				});
			}

			// 2. Prepare update data (remove undefined values)
			const cleanUpdateData: any = {};

			if (updateData.start_date !== undefined) cleanUpdateData.start_date = updateData.start_date;
			if (updateData.end_date !== undefined) cleanUpdateData.end_date = updateData.end_date;
			if (updateData.active !== undefined) cleanUpdateData.active = updateData.active;
			if (updateData.coach_id !== undefined) cleanUpdateData.coach_id = updateData.coach_id;
			if (updateData.coach_payment !== undefined) cleanUpdateData.coach_payment = updateData.coach_payment;
			if (updateData.payment_plan !== undefined) cleanUpdateData.payment_plan = updateData.payment_plan;

			// 3. Update the activity period record
			const { data: updatedPeriod, error: updateError } = await supabase
				.from("client_activity_period")
				.update({
					...cleanUpdateData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating activity period:", updateError);
				return returnValidationErrors(activityPeriodUpdateSchema, {
					_errors: ["Failed to update activity period. Please try again."],
				});
			}

			if (!updatedPeriod) {
				return returnValidationErrors(activityPeriodUpdateSchema, {
					_errors: ["Activity period update failed. Please try again."],
				});
			}

			// 4. Revalidate relevant paths
			revalidatePath("/dashboard/clients");
			revalidatePath(`/dashboard/clients/activity-periods/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Activity period updated successfully",
					activityPeriod: updatedPeriod,
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateActivityPeriod:", error);

			return returnValidationErrors(activityPeriodUpdateSchema, {
				_errors: ["Failed to update activity period. Please try again."],
			});
		}
	});