import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Star } from "lucide-react";
import { NoNPS } from "../empty-states/no-nps";
import { ManageNPSModal } from "../manage-nps-modal";
import {
	createNPSColumns,
	createNPSRowActions,
} from "../table-columns/nps-columns";

interface ClientNPSSectionProps {
	clientId: string;
	npsScores: any[];
	setDeleteModal: (modal: any) => void;
}

export function ClientNPSSection({
	clientId,
	npsScores,
	setDeleteModal,
}: ClientNPSSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const npsColumns = createNPSColumns();
	const npsRowActions = createNPSRowActions(setDeleteModal, setEditModal);

	const npsTable = useReactTable({
		data: npsScores || [],
		columns: npsColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!npsScores || npsScores.length === 0) {
		return <NoNPS clientId={clientId} />;
	}

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
				<UniversalDataTable
					table={npsTable}
					rowActions={npsRowActions}
					emptyStateMessage="No NPS scores recorded for this client"
				/>
			</CardContent>

			<ManageNPSModal
				clientId={clientId}
				npsScore={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "nps"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
