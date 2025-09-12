import { createClient } from "@/utils/supabase/client";

import { useQuery } from "@tanstack/react-query";

export function useActivePaymentPlans(clientId?: string | null, enabled = true) {
	return useQuery({
		queryKey: ["payment-plans", "active", clientId],
		queryFn: async () => {
			const supabase = createClient();
			let query = supabase
				.from("payment_plans")
				.select(`
					id, 
					client:clients!payment_plans_client_id_fkey(
						id,
						name
					),
					product:products!payment_plans_product_id_fkey(
						id,
						name,
						default_duration_months
					)
				`);
			
			// Filter by client if clientId is provided
			if (clientId) {
				query = query.eq("client_id", clientId);
			}
			
			const { data, error } = await query;

			if (error) throw error;
			return data || [];
		},
		enabled,
	});
}
