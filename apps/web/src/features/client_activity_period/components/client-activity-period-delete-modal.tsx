"use client";

import { useState } from "react";

import type { Database } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { format } from "date-fns";
import { AlertTriangleIcon } from "lucide-react";

type ClientActivityPeriodRow =
	Database["public"]["Tables"]["client_activity_period"]["Row"] & {
		client?: {
			id: string;
			name: string;
			email: string;
		} | null;
	};

interface ClientActivityPeriodDeleteModalProps {
	clientActivityPeriod: ClientActivityPeriodRow;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void>;
}

export function ClientActivityPeriodDeleteModal({
	clientActivityPeriod,
	open,
	onOpenChange,
	onConfirm,
}: ClientActivityPeriodDeleteModalProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirm = async () => {
		setIsDeleting(true);
		try {
			await onConfirm();
		} finally {
			setIsDeleting(false);
		}
	};

	const startDate = clientActivityPeriod.start_date
		? format(new Date(clientActivityPeriod.start_date), "MMM dd, yyyy")
		: "Unknown";

	const endDate = clientActivityPeriod.end_date
		? format(new Date(clientActivityPeriod.end_date), "MMM dd, yyyy")
		: "Ongoing";

	const clientName = clientActivityPeriod.client?.name || "Unknown Client";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
							<AlertTriangleIcon className="h-5 w-5 text-red-600" />
						</div>
						<div>
							<DialogTitle>Delete Activity Period</DialogTitle>
							<DialogDescription className="mt-1">
								This action cannot be undone.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4">
					<div className="rounded-md bg-muted p-4">
						<div className="space-y-2 text-sm">
							<div>
								<span className="font-medium">Client:</span> {clientName}
							</div>
							<div>
								<span className="font-medium">Period:</span> {startDate} -{" "}
								{endDate}
							</div>
							<div>
								<span className="font-medium">Status:</span>{" "}
								{clientActivityPeriod.active ? "Active" : "Inactive"}
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleConfirm}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete Activity Period"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
