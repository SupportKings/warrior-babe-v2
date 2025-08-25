import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { User } from "lucide-react";
import { ManageAssignmentModal } from "../manage-assignment-modal";

interface NoAssignmentsProps {
	clientId: string;
}

export function NoAssignments({ clientId }: NoAssignmentsProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Assigned Coaches
					</CardTitle>
					<ManageAssignmentModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<User className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No coaches assigned yet</p>
					<p className="mt-1 text-xs">
						Coaches will appear here once assigned to this client
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
