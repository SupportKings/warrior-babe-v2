"use client";

import { useState } from "react";

import type { Database } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { AlertTriangleIcon } from "lucide-react";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface ProductDeleteModalProps {
	product: ProductRow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void>;
}

export function ProductDeleteModal({
	product,
	open,
	onOpenChange,
	onConfirm,
}: ProductDeleteModalProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleConfirm = async () => {
		if (!product) return;

		setIsDeleting(true);
		try {
			await onConfirm();
		} finally {
			setIsDeleting(false);
		}
	};

	if (!product) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<div className="flex items-center gap-2">
						<AlertTriangleIcon className="h-5 w-5 text-destructive" />
						<DialogTitle>Delete Product</DialogTitle>
					</div>
					<DialogDescription>
						Are you sure you want to delete "{product.name}"? This action cannot
						be undone.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
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
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
