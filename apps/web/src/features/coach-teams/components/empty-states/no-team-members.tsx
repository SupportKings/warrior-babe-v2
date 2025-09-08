import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Users } from "lucide-react";
import { ManageTeamMemberModal } from "../manage-team-member-modal";

interface NoTeamMembersProps {
	teamId: string;
}

export function NoTeamMembers({ teamId }: NoTeamMembersProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Team Members
					</CardTitle>
					<ManageTeamMemberModal teamId={teamId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No team members yet</p>
					<p className="mt-1 text-xs">
						Team members will appear here once added to this coach team
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
