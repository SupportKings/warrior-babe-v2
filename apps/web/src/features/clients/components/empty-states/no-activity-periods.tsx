import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar } from "lucide-react";
import { ManageActivityPeriodModal } from "../manage-activity-period-modal";

interface NoActivityPeriodsProps {
	clientId: string;
}

export function NoActivityPeriods({ clientId }: NoActivityPeriodsProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Activity Periods
					</CardTitle>
					<ManageActivityPeriodModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No activity periods recorded</p>
					<p className="mt-1 text-xs">
						Activity periods will appear here once tracked for this client
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
