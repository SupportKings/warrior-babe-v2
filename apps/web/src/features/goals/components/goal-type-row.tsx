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
import { MoreHorizontal, Pencil, Trash, Target } from "lucide-react";
import type { GoalType } from "../types/goalType";

interface GoalTypeRowProps {
	goalType: GoalType;
	canManage: boolean;
	onEdit: (goalType: GoalType) => void;
	onDelete: (goalType: GoalType) => void;
}

export function GoalTypeRow({
	goalType,
	canManage,
	onEdit,
	onDelete,
}: GoalTypeRowProps) {
	return (
		<div className="flex h-9 items-center justify-between border-b bg-card px-4">
			<div className="flex items-center space-x-4">
				{/* Icon placeholder */}
				<div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
					<Target className="h-3 w-3" />
				</div>

				<div className="flex items-center space-x-2">
					<p className="font-medium text-sm leading-none">
						{goalType.name}
					</p>
				</div>

				<div className="flex items-center space-x-4 text-muted-foreground text-sm">
					{goalType.description && (
						<span className="hidden md:inline-block max-w-md truncate">
							{goalType.description}
						</span>
					)}

					{/* Measurable Badge */}
					{goalType.is_measurable && (
						<Badge variant="secondary" className="text-xs">
							{goalType.unit_of_measure || "Measurable"}
						</Badge>
					)}

					{/* Default Duration */}
					{goalType.default_duration_days && (
						<Badge variant="outline" className="text-xs">
							{goalType.default_duration_days} days
						</Badge>
					)}

					{/* Status */}
					<Badge
						variant={goalType.is_active ? "default" : "secondary"}
						className={cn(
							"text-xs",
							!goalType.is_active && "opacity-50"
						)}
					>
						{goalType.is_active ? "Active" : "Inactive"}
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
						<DropdownMenuItem onClick={() => onEdit(goalType)}>
							<Pencil className="mr-[6px] h-4 w-4" />
							Edit Goal Type
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onDelete(goalType)}
							className="text-destructive"
						>
							<Trash className="mr-[6px] h-4 w-4" />
							Delete Goal Type
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}