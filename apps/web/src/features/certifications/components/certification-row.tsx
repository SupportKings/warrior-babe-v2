"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Certification } from "@/features/coaches/queries/certifications.server";

interface CertificationRowProps {
	certification: Certification;
	canManage: boolean;
	onEdit: (certification: Certification) => void;
	onDelete: (certification: Certification) => void;
}

export default function CertificationRow({ 
	certification, 
	canManage,
	onEdit,
	onDelete
}: CertificationRowProps) {
	const [imageError, setImageError] = useState(false);

	return (
		<div className="flex h-auto min-h-[60px] items-center justify-between border-b bg-card px-4 py-3">
			<div className="flex items-center space-x-4 flex-1">
				{/* Icon */}
				<div className="flex-shrink-0 w-10 h-10 relative rounded-lg overflow-hidden bg-muted">
					{certification.icon && !imageError ? (
						<Image
							src={certification.icon}
							alt={certification.name}
							fill
							className="object-cover"
							onError={() => setImageError(true)}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-muted-foreground">
							<span className="text-lg font-semibold">
								{certification.name.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
				</div>

				{/* Name and Issuer */}
				<div className="flex-1 min-w-0">
					<p className="font-medium text-sm truncate">{certification.name}</p>
					<p className="text-xs text-muted-foreground truncate">{certification.issuer}</p>
				</div>

				{/* Description */}
				{certification.description && (
					<div className="hidden md:block flex-1 max-w-md">
						<p className="text-sm text-muted-foreground line-clamp-2">
							{certification.description}
						</p>
					</div>
				)}

				{/* Status */}
				<Badge variant={certification.is_active ? "default" : "secondary"}>
					{certification.is_active ? "Active" : "Inactive"}
				</Badge>
			</div>

			{/* Actions */}
			{canManage && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onEdit(certification)}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem 
							onClick={() => onDelete(certification)}
							className="text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}