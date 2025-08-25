import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Star } from "lucide-react";
import { ManageNPSModal } from "../manage-nps-modal";

interface NoNPSProps {
	clientId: string;
}

export function NoNPS({ clientId }: NoNPSProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Star className="h-5 w-5" />
						NPS Scores
					</CardTitle>
					<ManageNPSModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<Star className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No NPS scores recorded</p>
					<p className="mt-1 text-xs">
						NPS scores will appear here once collected from this client
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
