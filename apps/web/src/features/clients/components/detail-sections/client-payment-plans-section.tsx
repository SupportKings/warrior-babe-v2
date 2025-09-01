import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { CreditCard } from "lucide-react";
import { NoPaymentPlans } from "../empty-states/no-payment-plans";
import { ManagePaymentPlanModal } from "../manage-payment-plan-modal";
import {
	createPaymentPlanColumns,
	createPaymentPlanRowActions,
} from "../table-columns/payment-plan-columns";

interface ClientPaymentPlansSectionProps {
	clientId: string;
	paymentPlans: any[];
	setDeleteModal: (modal: any) => void;
}

export function ClientPaymentPlansSection({
	clientId,
	paymentPlans,
	setDeleteModal,
}: ClientPaymentPlansSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const paymentPlanColumns = createPaymentPlanColumns();
	const paymentPlanRowActions = createPaymentPlanRowActions(
		setDeleteModal,
		setEditModal,
	);

	const paymentPlanTable = useReactTable({
		data: paymentPlans || [],
		columns: paymentPlanColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!paymentPlans || paymentPlans.length === 0) {
		return <NoPaymentPlans clientId={clientId} />;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						Payment Plans
					</CardTitle>
					<ManagePaymentPlanModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={paymentPlanTable}
					rowActions={paymentPlanRowActions}
					emptyStateMessage="No payment plans setup for this client"
				/>
			</CardContent>

			<ManagePaymentPlanModal
				clientId={clientId}
				paymentPlan={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "payment_plan"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
