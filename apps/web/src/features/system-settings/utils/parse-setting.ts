import type {
	SystemSetting,
	SystemSettingDataType,
} from "../types/system-setting";

/**
 * Parse a system setting value based on its data type
 */
export function parseSettingValue<T = unknown>(
	value: string,
	dataType: SystemSettingDataType,
): T {
	switch (dataType) {
		case "string":
			return value as T;
		case "number":
		case "integer": {
			const numValue = Number(value);
			if (Number.isNaN(numValue)) {
				throw new Error(`Invalid number value: ${value}`);
			}
			return numValue as T;
		}
		case "boolean":
			if (value !== "true" && value !== "false") {
				throw new Error(`Invalid boolean value: ${value}`);
			}
			return (value === "true") as T;
		case "json":
			try {
				return JSON.parse(value) as T;
			} catch (error) {
				throw new Error(`Invalid JSON value: ${value}`);
			}
		default:
			throw new Error(`Unknown data type: ${dataType}`);
	}
}

/**
 * Convert a value to string for storage in system_settings
 */
export function stringifySettingValue(
	value: unknown,
	dataType: SystemSettingDataType,
): string {
	switch (dataType) {
		case "string":
			return String(value);
		case "number":
		case "integer":
			return String(value);
		case "boolean":
			return String(value);
		case "json":
			return JSON.stringify(value);
		default:
			throw new Error(`Unknown data type: ${dataType}`);
	}
}

/**
 * Get a parsed setting value with a fallback
 */
export function getSettingValue<T>(
	setting: SystemSetting | null | undefined,
	fallback: T,
): T {
	if (!setting) {
		return fallback;
	}

	try {
		return parseSettingValue<T>(
			setting.setting_value,
			setting.data_type as SystemSettingDataType,
		);
	} catch (error) {
		console.warn(`Failed to parse setting ${setting.setting_key}:`, error);
		return fallback;
	}
}
