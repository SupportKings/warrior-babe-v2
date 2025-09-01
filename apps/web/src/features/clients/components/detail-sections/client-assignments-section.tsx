import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { User } from "lucide-react";
import { NoAssignments } from "../empty-states/no-assignments";
import { ManageAssignmentModal } from "../manage-assignment-modal";
import {
	createAssignmentColumns,
	createAssignmentRowActions,
} from "../table-columns/assignment-columns";

interface ClientAssignmentsSectionProps {
	clientId: string;
	assignments: any[];
	setDeleteModal: (modal: any) => void;
}

export function ClientAssignmentsSection({
	clientId,
	assignments,
	setDeleteModal,
}: ClientAssignmentsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const assignmentColumns = createAssignmentColumns();
	const assignmentRowActions = createAssignmentRowActions(
		setDeleteModal,
		setEditModal,
	);

	const assignmentTable = useReactTable({
		data: assignments || [],
		columns: assignmentColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!assignments || assignments.length === 0) {
		return <NoAssignments clientId={clientId} />;
	}

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
				<UniversalDataTable
					table={assignmentTable}
					rowActions={assignmentRowActions}
					emptyStateMessage="No coaches assigned to this client"
				/>
			</CardContent>

			<ManageAssignmentModal
				clientId={clientId}
				assignment={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "assignment"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
