"use client";

import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { useAllGoalTypes } from "../queries/goalTypes";
import type { GoalType } from "../types/goalType";
import DeleteGoalTypeDialog from "./delete-goal-type-dialog";
import EditGoalTypeDialog from "./edit-goal-type-dialog";
import { GoalTypeGroup } from "./goal-type-group";

interface GoalTypesTableProps {
  permissions: any;
}

function GoalTypesSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="flex h-[60px] items-center justify-between border-b bg-card px-4"
        >
          <div className="flex flex-1 items-center space-x-4">
            {/* Icon Skeleton */}
            <Skeleton className="h-10 w-10 rounded-lg" />

            {/* Name and Category Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>

            {/* Description Skeleton */}
            <div className="hidden max-w-md flex-1 md:block">
              <Skeleton className="h-4 w-full" />
            </div>

            {/* Badges Skeleton */}
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Action Button Skeleton */}
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

export default function GoalTypesTable({ permissions }: GoalTypesTableProps) {
  const { data: goalTypes, isLoading } = useAllGoalTypes();
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    goalType: GoalType | null;
  }>({ open: false, goalType: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    goalType: GoalType | null;
  }>({ open: false, goalType: null });

  const canManageGoalTypes = Array.isArray(permissions)
    ? false
    : "user" in permissions && permissions.user?.includes("create");

  const handleEdit = (goalType: GoalType) => {
    setEditDialog({ open: true, goalType });
  };

  const handleDelete = (goalType: GoalType) => {
    setDeleteDialog({ open: true, goalType });
  };

  if (isLoading) {
    return <GoalTypesSkeleton />;
  }

  if (!goalTypes || goalTypes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <p>No goal types found. Create one to get started.</p>
      </div>
    );
  }

  // Group goal types by category
  const groupedGoalTypes = goalTypes.reduce((acc, goalType) => {
    const category = goalType.goal_categories?.name || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(goalType);
    return acc;
  }, {} as Record<string, GoalType[]>);

  // Sort the categories alphabetically
  const sortedCategories = Object.entries(groupedGoalTypes).sort(
    ([categoryA], [categoryB]) => categoryA.localeCompare(categoryB)
  );

  return (
    <>
      <div className="h-screen">
        {sortedCategories.map(([category, types]) => (
          <GoalTypeGroup
            key={category}
            category={category}
            goalTypes={types}
            canManage={canManageGoalTypes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {editDialog.goalType && (
        <EditGoalTypeDialog
          open={editDialog.open}
          onOpenChange={(open) =>
            setEditDialog({ open, goalType: editDialog.goalType })
          }
          goalType={editDialog.goalType}
        />
      )}

      {deleteDialog.goalType && (
        <DeleteGoalTypeDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog({ open, goalType: deleteDialog.goalType })
          }
          goalType={deleteDialog.goalType}
        />
      )}
    </>
  );
}
