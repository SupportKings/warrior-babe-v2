import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Clock } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return new Date(dateString).toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return "Invalid date";
	}
};

interface PaymentSystemInfoProps {
	payment: {
		created_at: string | null;
		updated_at: string | null;
	};
}

export function PaymentSystemInfo({ payment }: PaymentSystemInfoProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					System Information
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Created At
					</label>
					<p className="text-sm">{formatDate(payment.created_at)}</p>
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Last Updated
					</label>
					<p className="text-sm">{formatDate(payment.updated_at)}</p>
				</div>
			</CardContent>
		</Card>
	);
}
