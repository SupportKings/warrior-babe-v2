import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CreditCard } from "lucide-react";
import { ManagePaymentPlanTemplateModal } from "../manage-payment-plan-template-modal";

interface NoPaymentPlanTemplatesProps {
	productId: string;
}

export function NoPaymentPlanTemplates({
	productId,
}: NoPaymentPlanTemplatesProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						Payment Plan Templates
					</CardTitle>
					<ManagePaymentPlanTemplateModal productId={productId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<CreditCard className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No payment plan templates yet</p>
					<p className="mt-1 text-xs">
						Payment plan templates will appear here once added to this product
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
