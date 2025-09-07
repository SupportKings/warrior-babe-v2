import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Users } from "lucide-react";
import { NoTeamMembers } from "../empty-states/no-team-members";
import { ManageTeamMemberModal } from "../manage-team-member-modal";
import {
	createTeamMemberColumns,
	createTeamMemberRowActions,
} from "../table-columns/team-member-columns";

interface CoachTeamMembersSectionProps {
	teamId: string;
	teamMembers: any[];
	setDeleteModal: (modal: any) => void;
}

export function CoachTeamMembersSection({
	teamId,
	teamMembers,
	setDeleteModal,
}: CoachTeamMembersSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const teamMemberColumns = createTeamMemberColumns();
	const teamMemberRowActions = createTeamMemberRowActions(
		setDeleteModal,
		setEditModal,
	);
	console.log(teamMembers)
	const teamMemberTable = useReactTable({
		data: teamMembers || [],
		columns: teamMemberColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!teamMembers || teamMembers.length === 0) {
		return <NoTeamMembers teamId={teamId} />;
	}

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
				<UniversalDataTable
					table={teamMemberTable}
					rowActions={teamMemberRowActions}
					emptyStateMessage="No team members found for this coach team"
				/>
			</CardContent>

			<ManageTeamMemberModal
				teamId={teamId}
				teamMember={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "team_member"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
