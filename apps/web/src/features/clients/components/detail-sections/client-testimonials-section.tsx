import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";

import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { MessageSquare } from "lucide-react";
import { NoTestimonials } from "../empty-states/no-testimonials";
import { ManageTestimonialModal } from "../manage-testimonial-modal";
import {
	createTestimonialColumns,
	createTestimonialRowActions,
} from "../table-columns/testimonial-columns";

interface ClientTestimonialsSectionProps {
	clientId: string;
	testimonials: any[];
	setDeleteModal: (modal: any) => void;
}

export function ClientTestimonialsSection({
	clientId,
	testimonials,
	setDeleteModal,
}: ClientTestimonialsSectionProps) {
	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		type: string;
		data: any;
	}>({
		isOpen: false,
		type: "",
		data: null,
	});

	const testimonialColumns = createTestimonialColumns();
	const testimonialRowActions = createTestimonialRowActions(
		setDeleteModal,
		setEditModal,
	);

	const testimonialTable = useReactTable({
		data: testimonials || [],
		columns: testimonialColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (!testimonials || testimonials.length === 0) {
		return <NoTestimonials clientId={clientId} />;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Testimonials
					</CardTitle>
					<ManageTestimonialModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<UniversalDataTable
					table={testimonialTable}
					rowActions={testimonialRowActions}
					emptyStateMessage="No testimonials collected from this client"
				/>
			</CardContent>

			<ManageTestimonialModal
				clientId={clientId}
				testimonial={editModal.data}
				mode="edit"
				open={editModal.isOpen && editModal.type === "testimonial"}
				onOpenChange={(open: boolean) =>
					setEditModal((prev) => ({ ...prev, isOpen: open }))
				}
			/>
		</Card>
	);
}
