import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Mail } from "lucide-react";
import { NoEmails } from "../empty-states/no-emails";
import { ManageEmailModal } from "../manage-email-modal";
import {
	createEmailColumns,
	createEmailRowActions,
} from "../table-columns/email-columns";

interface ClientEmailsSectionProps {
	clientId: string;
	emails: any[];
	setDeleteModal: (modal: any) => void;
}

export function ClientEmailsSection({
	clientId,
	emails,
	setDeleteModal,
}: ClientEmailsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const emailColumns = createEmailColumns();
	const emailRowActions = createEmailRowActions(setDeleteModal, setEditModal);

	const emailTable = useReactTable({
		data: emails || [],
		columns: emailColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!emails || emails.length === 0) {
		return <NoEmails clientId={clientId} />;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Email Addresses
					</CardTitle>
					<ManageEmailModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={emailTable}
					rowActions={emailRowActions}
					emptyStateMessage="No email addresses recorded for this client"
				/>
			</CardContent>

			<ManageEmailModal
				clientId={clientId}
				email={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "email"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}