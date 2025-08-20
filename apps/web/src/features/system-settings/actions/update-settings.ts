"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { stringifySettingValue } from "../utils/parse-setting";
import type { SystemSettingDataType } from "../types/system-setting";

const updateSystemSettingsSchema = z.object({
	settings: z.array(
		z.object({
			key: z.string(),
			value: z.union([z.string(), z.number(), z.boolean()]),
			dataType: z.enum(["string", "number", "integer", "boolean", "json"]),
			description: z.string().optional(),
		}),
	),
});

export const updateSystemSettings = actionClient
	.inputSchema(updateSystemSettingsSchema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		// Update each setting
		const results = await Promise.all(
			parsedInput.settings.map(async (setting) => {
				// Convert value to string for storage
				const stringValue = stringifySettingValue(
					setting.value,
					setting.dataType as SystemSettingDataType,
				);

				// Update the setting
				const { data, error } = await supabase
					.from("system_settings")
					.update({
						setting_value: stringValue,
						data_type: setting.dataType,
						description: setting.description,
					})
					.eq("setting_key", setting.key)
					.select()
					.single();

				if (error) {
					console.error(`Failed to update setting ${setting.key}:`, error);
					throw new Error(`Failed to update setting ${setting.key}`);
				}

				return data;
			}),
		);

		return {
			success: true,
			updatedSettings: results,
		};
	});