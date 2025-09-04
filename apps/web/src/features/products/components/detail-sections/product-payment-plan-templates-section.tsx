import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { CreditCard } from "lucide-react";
import { NoPaymentPlanTemplates } from "../empty-states/no-payment-plan-templates";
import { ManagePaymentPlanTemplateModal } from "../manage-payment-plan-template-modal";
import {
	createPaymentPlanTemplateColumns,
	createPaymentPlanTemplateRowActions,
} from "../table-columns/payment-plan-template-columns";

interface ProductPaymentPlanTemplatesSectionProps {
	productId: string;
	paymentPlanTemplates: any[];
	setDeleteModal: (modal: any) => void;
}

export function ProductPaymentPlanTemplatesSection({
	productId,
	paymentPlanTemplates,
	setDeleteModal,
}: ProductPaymentPlanTemplatesSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const paymentPlanTemplateColumns = createPaymentPlanTemplateColumns();
	const paymentPlanTemplateRowActions = createPaymentPlanTemplateRowActions(
		setDeleteModal,
		setEditModal,
	);

	const paymentPlanTemplateTable = useReactTable({
		data: paymentPlanTemplates || [],
		columns: paymentPlanTemplateColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!paymentPlanTemplates || paymentPlanTemplates.length === 0) {
		return <NoPaymentPlanTemplates productId={productId} />;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						Payment Plan Templates
					</CardTitle>
					<ManagePaymentPlanTemplateModal productId={productId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={paymentPlanTemplateTable}
					rowActions={paymentPlanTemplateRowActions}
					emptyStateMessage="No payment plan templates found for this product"
				/>
			</CardContent>

			<ManagePaymentPlanTemplateModal
				productId={productId}
				paymentPlanTemplate={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "payment_plan_template"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
