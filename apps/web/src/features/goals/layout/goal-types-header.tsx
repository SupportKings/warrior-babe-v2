"use client";

import { useState } from "react";
import type { AnyRoleStatements } from "@/lib/permissions";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Settings2 } from "lucide-react";

import CreateGoalTypeDialog from "../components/create-goal-type-dialog";
import CategoryManagementDialog from "@/components/category-management-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goalCategoryQueries } from "@/features/goals/queries/categories.queries";

interface GoalTypesHeaderProps {
	permissions: AnyRoleStatements;
}

export default function GoalTypesHeader({ permissions }: GoalTypesHeaderProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	// Check if user has admin permissions to manage goal types
	const canManageGoalTypes = Array.isArray(permissions)
		? false
		: "user" in permissions && permissions.user?.includes("create");

	// Fetch categories
	const { data: categories = [], isLoading } = useQuery(
		goalCategoryQueries.all()
	);

	const handleCreateCategory = async (data: {
		name: string;
		description?: string;
	}) => {
		const { createGoalCategory } = await import("@/features/goals/actions/manageCategories");
		const result = await createGoalCategory(data);
		if (result?.data?.success) {
			await queryClient.invalidateQueries({
				queryKey: ["goal-categories"],
			});
		}
	};

	const handleUpdateCategory = async (
		id: string,
		data: { name: string; description?: string; is_active: boolean }
	) => {
		const { updateGoalCategory } = await import("@/features/goals/actions/manageCategories");
		const result = await updateGoalCategory({ id, ...data });
		if (result?.data?.success) {
			await queryClient.invalidateQueries({
				queryKey: ["goal-categories"],
			});
		}
	};

	const handleDeleteCategory = async (id: string) => {
		const { deleteGoalCategory } = await import("@/features/goals/actions/manageCategories");
		const result = await deleteGoalCategory({ id });
		if (result?.data?.success) {
			await queryClient.invalidateQueries({
				queryKey: ["goal-categories"],
			});
		}
	};

	return (
		<>
			<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
				<div className="flex items-center gap-2">
					<SidebarTrigger />
					<h1 className="font-medium text-[13px]">Goal Types</h1>
				</div>
				{canManageGoalTypes && (
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
							Add Goal Type
						</Button>
					</div>
				)}
			</div>

			<CreateGoalTypeDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>

			<CategoryManagementDialog
				open={categoryDialogOpen}
				onOpenChange={setCategoryDialogOpen}
				title="Manage Goal Categories"
				description="Create and manage categories for organizing goal types."
				categories={categories}
				isLoading={isLoading}
				onCreateCategory={handleCreateCategory}
				onUpdateCategory={handleUpdateCategory}
				onDeleteCategory={handleDeleteCategory}
			/>
		</>
	);
}