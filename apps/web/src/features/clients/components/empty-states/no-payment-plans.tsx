import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CreditCard } from "lucide-react";
import { ManagePaymentPlanModal } from "../manage-payment-plan-modal";

interface NoPaymentPlansProps {
	clientId: string;
}

export function NoPaymentPlans({ clientId }: NoPaymentPlansProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						Payment Plans
					</CardTitle>
					<ManagePaymentPlanModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<CreditCard className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No payment plans setup</p>
					<p className="mt-1 text-xs">
						Payment plans will appear here once created for this client
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
