import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Target } from "lucide-react";
import { ManageGoalModal } from "../manage-goal-modal";

interface NoGoalsProps {
	clientId: string;
}

export function NoGoals({ clientId }: NoGoalsProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						Goals
					</CardTitle>
					<ManageGoalModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No goals set yet</p>
					<p className="mt-1 text-xs">
						Client goals will appear here once they are created
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
