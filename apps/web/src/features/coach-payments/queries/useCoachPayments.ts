import { createClient } from "@/utils/supabase/client";

import { useQuery } from "@tanstack/react-query";

export function useActiveCoachPayments(enabled = true) {
	return useQuery({
		queryKey: ["coach-payments", "active"],
		queryFn: async () => {
			const supabase = createClient();
			const { data, error } = await supabase
				.from("coach_payments")
				.select(`
					id,
					amount,
					date,
					status,
					coach:team_members!coach_payments_coach_id_fkey(
						id,
						name
					)
				`)
				.order("date", { ascending: false });

			if (error) throw error;
			return data || [];
		},
		enabled,
	});
}
