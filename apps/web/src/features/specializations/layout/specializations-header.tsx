"use client";

import { useState } from "react";
import type { AnyRoleStatements } from "@/lib/permissions";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Settings2 } from "lucide-react";

import CreateSpecializationDialog from "@/features/specializations/components/create-specialization-dialog";
import CategoryManagementDialog from "@/components/category-management-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { specializationCategoryQueries } from "@/features/specializations/queries/categories.queries";

interface SpecializationsHeaderProps {
	permissions: AnyRoleStatements;
}

export default function SpecializationsHeader({ permissions }: SpecializationsHeaderProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	// Check if user has admin permissions to manage specializations
	const canManageSpecializations = Array.isArray(permissions)
		? false
		: "user" in permissions && permissions.user?.includes("create");

	// Fetch categories
	const { data: categories = [], isLoading } = useQuery(
		specializationCategoryQueries.all()
	);

	const handleCreateCategory = async (data: {
		name: string;
		description?: string;
	}) => {
		const { createSpecializationCategory } = await import("@/features/specializations/actions/manageCategories");
		const result = await createSpecializationCategory(data);
		if (result?.data?.success) {
			await queryClient.invalidateQueries({
				queryKey: ["specialization-categories"],
			});
		}
	};

	const handleUpdateCategory = async (
		id: string,
		data: { name: string; description?: string; is_active: boolean }
	) => {
		const { updateSpecializationCategory } = await import("@/features/specializations/actions/manageCategories");
		const result = await updateSpecializationCategory({ id, ...data });
		if (result?.data?.success) {
			await queryClient.invalidateQueries({
				queryKey: ["specialization-categories"],
			});
		}
	};

	const handleDeleteCategory = async (id: string) => {
		const { deleteSpecializationCategory } = await import("@/features/specializations/actions/manageCategories");
		const result = await deleteSpecializationCategory({ id });
		if (result?.data?.success) {
			await queryClient.invalidateQueries({
				queryKey: ["specialization-categories"],
			});
		}
	};

	return (
		<>
			<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
				<div className="flex items-center gap-2">
					<SidebarTrigger />
					<h1 className="font-medium text-[13px]">Specializations</h1>
				</div>
				{canManageSpecializations && (
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => setCategoryDialogOpen(true)}
							className="gap-2"
						>
							<Settings2 className="h-4 w-4" />
							Categories
						</Button>
						<Button
							size="sm"
							onClick={() => setCreateDialogOpen(true)}
							className="gap-2"
						>
							<Plus className="h-4 w-4" />
							Add Specialization
						</Button>
					</div>
				)}
			</div>

			<CreateSpecializationDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>

			<CategoryManagementDialog
				open={categoryDialogOpen}
				onOpenChange={setCategoryDialogOpen}
				title="Manage Specialization Categories"
				description="Create and manage categories for organizing specializations."
				categories={categories}
				isLoading={isLoading}
				onCreateCategory={handleCreateCategory}
				onUpdateCategory={handleUpdateCategory}
				onDeleteCategory={handleDeleteCategory}
			/>
		</>
	);
}