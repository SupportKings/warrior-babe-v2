import type { Tables } from "@/utils/supabase/database.types";

export type SystemSetting = Tables<"system_settings">;

export interface SystemSettingWithParsedValue<T = unknown> extends Omit<SystemSetting, "setting_value"> {
	setting_value: T;
}

export type SystemSettingDataType = "string" | "number" | "integer" | "boolean" | "json";

export interface CreateSystemSettingInput {
	setting_key: string;
	setting_value: string;
	data_type: SystemSettingDataType;
	description?: string;
}

export interface UpdateSystemSettingInput {
	setting_value: string;
	data_type?: SystemSettingDataType;
	description?: string;
}