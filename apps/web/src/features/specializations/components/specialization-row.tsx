"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { Specialization } from "@/features/coaches/queries/specializations.server";
import { IconDisplay } from "@/features/icons";

import { MoreHorizontal, Pencil, Trash, Briefcase } from "lucide-react";

interface SpecializationRowProps {
  specialization: Specialization;
  canManage: boolean;
  onEdit: (specialization: Specialization) => void;
  onDelete: (specialization: Specialization) => void;
}

export default function SpecializationRow({
  specialization,
  canManage,
  onEdit,
  onDelete,
}: SpecializationRowProps) {
  return (
    <div className="flex h-9 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center space-x-4">
        {/* Icon */}
        <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
          <IconDisplay
            iconKey={specialization.icon || undefined}
            className="h-3 w-3"
            fallback={<Briefcase className="h-3 w-3" />}
          />
        </div>

        <div className="flex items-center space-x-2">
          <p className="font-medium text-sm leading-none">
            {specialization.name}
          </p>
        </div>

        <div className="flex items-center space-x-4 text-muted-foreground text-sm">
          {specialization.description && (
            <span className="hidden md:inline-block max-w-md truncate">
              {specialization.description}
            </span>
          )}

          {/* Status */}
          <Badge
            variant={specialization.is_active ? "default" : "secondary"}
            className={cn(
              "text-xs",
              !specialization.is_active && "opacity-50"
            )}
          >
            {specialization.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(specialization)}>
              <Pencil className="mr-[6px] h-4 w-4" />
              Edit Specialization
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(specialization)}
              className="text-destructive"
            >
              <Trash className="mr-[6px] h-4 w-4" />
              Delete Specialization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
