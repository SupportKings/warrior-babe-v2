import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface PaymentCustomerDetailsProps {
	customer: {
		customer_email_address: string | null;
		customer_name: string | null;
		customer_billing_address: string | null;
		payment_plan_name: string | null;
		slot_amount_due: number | null;
		slot_amount_paid: number | null;
	};
}

export function PaymentCustomerDetails({
	customer,
}: PaymentCustomerDetailsProps) {
	const formatAmount = (amount: number | null) => {
		if (!amount) return "$0.00";
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
		}).format(amount);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					Customer Details
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Customer Email
					</label>
					<p className="text-sm">{customer.customer_email_address || "Not provided"}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Customer Name
					</label>
					<p className="text-sm">{customer.customer_name || "Not provided"}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Billing Address
					</label>
					<p className="text-sm">{customer.customer_billing_address || "Not provided"}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Payment Plan
					</label>
					<p className="text-sm">{customer.payment_plan_name || "No payment plan linked"}</p>
				</div>
				{customer.slot_amount_due !== null && (
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Slot Amount Due
						</label>
						<p className="text-sm font-semibold">{formatAmount(customer.slot_amount_due)}</p>
					</div>
				)}
				{customer.slot_amount_paid !== null && (
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Slot Amount Paid
						</label>
						<p className="text-sm font-semibold">{formatAmount(customer.slot_amount_paid)}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}