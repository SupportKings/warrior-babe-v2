import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CheckCircle2 } from "lucide-react";
import { ManageWinModal } from "../manage-win-modal";

interface NoWinsProps {
	clientId: string;
}

export function NoWins({ clientId }: NoWinsProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<CheckCircle2 className="h-5 w-5" />
						Wins
					</CardTitle>
					<ManageWinModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<CheckCircle2 className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No wins recorded yet</p>
					<p className="mt-1 text-xs">
						Client achievements and wins will appear here once recorded
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
