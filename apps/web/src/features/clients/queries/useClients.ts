

import { useQuery } from "@tanstack/react-query";
import { type Client, getClients } from "./getClients";

export function useClients() {
	return useQuery<Client[]>({
		queryKey: ["clients"],
		queryFn: async () => {
			const result = await getClients();
			if (result.error) {
				throw new Error(result.error.message || "Failed to fetch clients");
			}
			return result.clients;
		},
		staleTime: 60 * 1000, // 1 minute
	});
}
