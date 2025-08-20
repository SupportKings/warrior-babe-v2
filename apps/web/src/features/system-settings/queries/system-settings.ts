import { queryOptions, useQuery } from "@tanstack/react-query";
import {
	getAllSystemSettings,
	getSystemSetting,
	getSystemSettings,
} from "./server-queries";

export const systemSettingsQueries = {
	single: (key: string) =>
		queryOptions({
			queryKey: ["system-settings", key],
			queryFn: () => getSystemSetting(key),
		}),

	multiple: (keys: string[]) =>
		queryOptions({
			queryKey: ["system-settings", "multiple", keys],
			queryFn: () => getSystemSettings(keys),
		}),

	all: () =>
		queryOptions({
			queryKey: ["system-settings", "all"],
			queryFn: () => getAllSystemSettings(),
		}),
};

export function useSystemSetting(key: string) {
	return useQuery(systemSettingsQueries.single(key));
}

export function useSystemSettings(keys: string[]) {
	return useQuery(systemSettingsQueries.multiple(keys));
}

export function useAllSystemSettings() {
	return useQuery(systemSettingsQueries.all());
}
