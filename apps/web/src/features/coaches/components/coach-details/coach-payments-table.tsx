"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUniversalTable } from "@/components/universal-data-table/hooks/use-universal-table";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import { DollarSign, Plus } from "lucide-react";
import { coachPaymentColumns } from "./columns/coach-payments-columns";
import { DeleteCoachPaymentModal } from "./delete-coach-payment-modal";
import { ManageCoachPaymentModal } from "./manage-coach-payment-modal";

type CoachPayment = {
	id: string;
	date: string;
	total_clients: number;
	total_active_clients: number;
	status: string;
};

interface CoachPaymentsTableProps {
	payments: CoachPayment[];
	coachId: string;
}

export function CoachPaymentsTable({
	payments,
	coachId,
}: CoachPaymentsTableProps) {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
		null,
	);

	const handleEdit = (paymentId: string) => {
		setSelectedPaymentId(paymentId);
		setIsEditModalOpen(true);
	};

	const handleDelete = (paymentId: string) => {
		setSelectedPaymentId(paymentId);
		setIsDeleteModalOpen(true);
	};

	const columns = coachPaymentColumns({
		onEdit: handleEdit,
		onDelete: handleDelete,
	});

	const tableConfig = useUniversalTable<CoachPayment>({
		data: payments || [],
		totalCount: payments?.length || 0,
		columns: columns,
		columnsConfig: [], // No filters needed for detail view
		filters: [],
		onFiltersChange: () => {},
		enableSelection: false,
		pageSize: 10,
		serverSide: true,
	});

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="h-5 w-5" />
							Payroll Payments
						</CardTitle>
						<Button onClick={() => setIsAddModalOpen(true)} size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Payroll Payment
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{payments && payments.length > 0 ? (
						<UniversalDataTable
							table={tableConfig.table}
							totalCount={tableConfig.totalCount}
						/>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="font-semibold text-lg">No Payroll Payments</h3>
							<p className="mb-4 text-muted-foreground">
								No payroll payments have been recorded for this team member yet.
							</p>
							<Button onClick={() => setIsAddModalOpen(true)} variant="outline">
								<Plus className="mr-2 h-4 w-4" />
								Add First Payroll Payment
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Add Payment Modal */}
			<ManageCoachPaymentModal
				open={isAddModalOpen}
				onOpenChange={setIsAddModalOpen}
				coachId={coachId}
				mode="create"
			/>

			{/* Edit Payment Modal */}
			{selectedPaymentId && (
				<ManageCoachPaymentModal
					open={isEditModalOpen}
					onOpenChange={setIsEditModalOpen}
					coachId={coachId}
					paymentId={selectedPaymentId}
					mode="edit"
				/>
			)}

			{/* Delete Payment Modal */}
			{selectedPaymentId && (
				<DeleteCoachPaymentModal
					open={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
					paymentId={selectedPaymentId}
					coachId={coachId}
				/>
			)}
		</>
	);
}
