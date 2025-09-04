import { createClient } from "@/utils/supabase/client";

import { useQuery } from "@tanstack/react-query";

export function useActivePaymentPlans(enabled = true) {
	return useQuery({
		queryKey: ["payment-plans", "active"],
		queryFn: async () => {
			const supabase = createClient();
			const { data, error } = await supabase
				.from("payment_plans")
				.select(`
					id, 
					name,
					client:clients!payment_plans_client_id_fkey(
						id,
						name
					)
				`)
				.order("name");

			if (error) throw error;
			return data || [];
		},
		enabled,
	});
}
