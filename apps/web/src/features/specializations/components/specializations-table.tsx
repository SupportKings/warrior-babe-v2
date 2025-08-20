"use client";

import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { useAllSpecializations } from "@/features/coaches/queries/specializations";
import type { Specialization } from "@/features/coaches/queries/specializations.server";

import DeleteSpecializationDialog from "./delete-specialization-dialog";
import EditSpecializationDialog from "./edit-specialization-dialog";
import { SpecializationGroup } from "./specialization-group";

interface SpecializationsTableProps {
  permissions: any;
}

function SpecializationsSkeleton() {
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

export default function SpecializationsTable({
  permissions,
}: SpecializationsTableProps) {
  const { data: specializations, isLoading } = useAllSpecializations();
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    specialization: Specialization | null;
  }>({ open: false, specialization: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    specialization: Specialization | null;
  }>({ open: false, specialization: null });

  const canManageSpecializations = Array.isArray(permissions)
    ? false
    : "user" in permissions && permissions.user?.includes("create");

  const handleEdit = (specialization: Specialization) => {
    setEditDialog({ open: true, specialization });
  };

  const handleDelete = (specialization: Specialization) => {
    setDeleteDialog({ open: true, specialization });
  };

  if (isLoading) {
    return <SpecializationsSkeleton />;
  }

  if (!specializations || specializations.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <p>No specializations found. Create one to get started.</p>
      </div>
    );
  }

  // Group specializations by category
  const groupedSpecializations = specializations.reduce((acc, specialization) => {
    const categoryName = specialization.specialization_category?.name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(specialization);
    return acc;
  }, {} as Record<string, Specialization[]>);

  // Sort the categories alphabetically
  const sortedCategories = Object.entries(groupedSpecializations).sort(
    ([categoryA], [categoryB]) => categoryA.localeCompare(categoryB)
  );

  return (
    <>
      <div className="h-screen">
        {sortedCategories.map(([category, specs]) => (
          <SpecializationGroup
            key={category}
            category={category}
            specializations={specs}
            canManage={canManageSpecializations}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {editDialog.specialization && (
        <EditSpecializationDialog
          open={editDialog.open}
          onOpenChange={(open) =>
            setEditDialog({ open, specialization: editDialog.specialization })
          }
          specialization={editDialog.specialization}
        />
      )}

      {deleteDialog.specialization && (
        <DeleteSpecializationDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog({
              open,
              specialization: deleteDialog.specialization,
            })
          }
          specialization={deleteDialog.specialization}
        />
      )}
    </>
  );
}
