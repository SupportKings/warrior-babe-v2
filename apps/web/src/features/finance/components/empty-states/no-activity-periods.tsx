import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface NoActivityPeriodsProps {
	coachPaymentId: string;
}

export function NoActivityPeriods({ coachPaymentId }: NoActivityPeriodsProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Client Activity Periods
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No activity periods yet</p>
					<p className="mt-1 text-xs">
						Activity periods will appear here once attached to this coach payment
					</p>
				</div>
			</CardContent>
		</Card>
	);
}