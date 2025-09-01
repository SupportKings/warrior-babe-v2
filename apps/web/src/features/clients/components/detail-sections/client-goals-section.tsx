import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Target } from "lucide-react";
import { NoGoals } from "../empty-states/no-goals";
import { ManageGoalModal } from "../manage-goal-modal";
import {
	createGoalColumns,
	createGoalRowActions,
} from "../table-columns/goal-columns";

interface ClientGoalsSectionProps {
	clientId: string;
	goals: any[];
	setDeleteModal: (modal: any) => void;
}

export function ClientGoalsSection({
	clientId,
	goals,
	setDeleteModal,
}: ClientGoalsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const goalColumns = createGoalColumns();
	const goalRowActions = createGoalRowActions(setDeleteModal, setEditModal);

	const goalTable = useReactTable({
		data: goals || [],
		columns: goalColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!goals || goals.length === 0) {
		return <NoGoals clientId={clientId} />;
	}

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
				<UniversalDataTable
					table={goalTable}
					rowActions={goalRowActions}
					emptyStateMessage="No goals set for this client"
				/>
			</CardContent>

			<ManageGoalModal
				clientId={clientId}
				goal={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "goal"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
