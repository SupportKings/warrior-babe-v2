import { getStripePaymentDetails } from "@/features/finance/actions/getStripePaymentDetails";

import { useQuery } from "@tanstack/react-query";

export function useStripePaymentDetails(chargeId: string) {
	return useQuery({
		queryKey: ["stripe-payment-details", chargeId],
		queryFn: () => getStripePaymentDetails(chargeId),
		enabled: !!chargeId,
	});
}
