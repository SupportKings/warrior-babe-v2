"use server";

import { createClient } from "@/utils/supabase/server";

import type { SystemSetting } from "../types/system-setting";

/**
 * Get a system setting by key
 */
export async function getSystemSetting(
	key: string,
): Promise<SystemSetting | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("system_settings")
		.select("*")
		.eq("setting_key", key)
		.single();

	if (error) {
		console.warn(`Failed to fetch system setting ${key}:`, error);
		return null;
	}

	return data;
}

/**
 * Get multiple system settings by keys
 */
export async function getSystemSettings(
	keys: string[],
): Promise<SystemSetting[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("system_settings")
		.select("*")
		.in("setting_key", keys);

	if (error) {
		console.warn("Failed to fetch system settings:", error);
		return [];
	}

	return data || [];
}

/**
 * Get all system settings
 */
export async function getAllSystemSettings(): Promise<SystemSetting[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("system_settings")
		.select("*")
		.order("setting_key");

	if (error) {
		console.warn("Failed to fetch all system settings:", error);
		return [];
	}

	return data || [];
}
