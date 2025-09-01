import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import { NoActivityPeriods } from "../empty-states/no-activity-periods";
import { ManageActivityPeriodModal } from "../manage-activity-period-modal";
import {
	createActivityPeriodColumns,
	createActivityPeriodRowActions,
} from "../table-columns/activity-period-columns";

interface ClientActivityPeriodsSectionProps {
	clientId: string;
	activityPeriods: any[];
	setDeleteModal: (modal: any) => void;
}

export function ClientActivityPeriodsSection({
	clientId,
	activityPeriods,
	setDeleteModal,
}: ClientActivityPeriodsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const activityPeriodColumns = createActivityPeriodColumns();
	const activityPeriodRowActions = createActivityPeriodRowActions(
		setDeleteModal,
		setEditModal,
	);

	const activityPeriodTable = useReactTable({
		data: Array.isArray(activityPeriods) ? activityPeriods : [],
		columns: activityPeriodColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!activityPeriods || activityPeriods.length === 0) {
		return <NoActivityPeriods clientId={clientId} />;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Activity Periods
					</CardTitle>
					<ManageActivityPeriodModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={activityPeriodTable}
					rowActions={activityPeriodRowActions}
					emptyStateMessage="No activity periods recorded for this client"
				/>
			</CardContent>

			<ManageActivityPeriodModal
				clientId={clientId}
				activityPeriod={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "activity_period"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
