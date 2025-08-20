"use client";

import { useState } from "react";
import type { AnyRoleStatements } from "@/lib/permissions";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import CreateCertificationTypeDialog from "@/features/coaches/components/create-certification-type-dialog";

interface CertificationsHeaderProps {
	permissions: AnyRoleStatements;
}

export default function CertificationsHeader({ permissions }: CertificationsHeaderProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	// Check if user has admin permissions to manage certifications
	const canManageCertifications = Array.isArray(permissions)
		? false
		: "user" in permissions && permissions.user?.includes("create");

	return (
		<>
			<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
				<div className="flex items-center gap-2">
					<SidebarTrigger />
					<h1 className="font-medium text-[13px]">Certifications</h1>
				</div>
				{canManageCertifications && (
					<Button
						size="sm"
						onClick={() => setCreateDialogOpen(true)}
						className="gap-2"
					>
						<Plus className="h-4 w-4" />
						Add Certification Type
					</Button>
				)}
			</div>

			<CreateCertificationTypeDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>
		</>
	);
}