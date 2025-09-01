import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { CheckCircle2 } from "lucide-react";
import { NoWins } from "../empty-states/no-wins";
import { ManageWinModal } from "../manage-win-modal";
import {
	createWinColumns,
	createWinRowActions,
} from "../table-columns/win-columns";

interface ClientWinsSectionProps {
	clientId: string;
	wins: any[];
	setDeleteModal: (modal: any) => void;
}

export function ClientWinsSection({
	clientId,
	wins,
	setDeleteModal,
}: ClientWinsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const winColumns = createWinColumns();
	const winRowActions = createWinRowActions(setDeleteModal, setEditModal);

	const winTable = useReactTable({
		data: wins || [],
		columns: winColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!wins || wins.length === 0) {
		return <NoWins clientId={clientId} />;
	}

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
				<UniversalDataTable
					table={winTable}
					rowActions={winRowActions}
					emptyStateMessage="No wins recorded for this client"
				/>
			</CardContent>

			<ManageWinModal
				clientId={clientId}
				win={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "win"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
