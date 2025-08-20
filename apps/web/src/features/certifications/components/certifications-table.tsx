"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";
import type { Certification } from "@/features/coaches/queries/certifications.server";
import { useAllCertifications } from "@/features/coaches/queries/certifications";
import CertificationRow from "./certification-row";
import EditCertificationDialog from "./edit-certification-dialog";
import DeleteCertificationDialog from "./delete-certification-dialog";

interface CertificationsTableProps {
	permissions: any;
}

function CertificationsSkeleton() {
	return (
		<div className="space-y-0">
			{Array.from({ length: 5 }).map((_, idx) => (
				<div
					key={idx}
					className="flex h-[60px] items-center justify-between border-b bg-card px-4"
				>
					<div className="flex items-center space-x-4 flex-1">
						{/* Icon Skeleton */}
						<Skeleton className="h-10 w-10 rounded-lg" />

						{/* Name and Issuer Skeleton */}
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-24" />
						</div>

						{/* Description Skeleton */}
						<div className="hidden md:block flex-1 max-w-md">
							<Skeleton className="h-4 w-full" />
						</div>

						{/* Status Skeleton */}
						<Skeleton className="h-6 w-16" />
					</div>

					{/* Action Button Skeleton */}
					<Skeleton className="h-8 w-8" />
				</div>
			))}
		</div>
	);
}

export default function CertificationsTable({ permissions }: CertificationsTableProps) {
	const { data: certifications, isLoading } = useAllCertifications();
	const [editDialog, setEditDialog] = useState<{
		open: boolean;
		certification: Certification | null;
	}>({ open: false, certification: null });
	const [deleteDialog, setDeleteDialog] = useState<{
		open: boolean;
		certification: Certification | null;
	}>({ open: false, certification: null });

	const canManageCertifications = Array.isArray(permissions)
		? false
		: "user" in permissions && permissions.user?.includes("create");

	const handleEdit = (certification: Certification) => {
		setEditDialog({ open: true, certification });
	};

	const handleDelete = (certification: Certification) => {
		setDeleteDialog({ open: true, certification });
	};

	if (isLoading) {
		return <CertificationsSkeleton />;
	}

	if (!certifications || certifications.length === 0) {
		return (
			<div className="flex items-center justify-center h-64 text-muted-foreground">
				<p>No certifications found. Create one to get started.</p>
			</div>
		);
	}

	return (
		<>
			<AnimatedList>
				{certifications.map((certification) => (
					<AnimatedListItem key={certification.id} itemKey={certification.id}>
						<CertificationRow
							certification={certification}
							canManage={canManageCertifications}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					</AnimatedListItem>
				))}
			</AnimatedList>

			{editDialog.certification && (
				<EditCertificationDialog
					open={editDialog.open}
					onOpenChange={(open) => setEditDialog({ open, certification: editDialog.certification })}
					certification={editDialog.certification}
				/>
			)}

			{deleteDialog.certification && (
				<DeleteCertificationDialog
					open={deleteDialog.open}
					onOpenChange={(open) => setDeleteDialog({ open, certification: deleteDialog.certification })}
					certification={deleteDialog.certification}
				/>
			)}
		</>
	);
}