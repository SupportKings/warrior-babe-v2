"use client";

import Link from "next/link";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { useCoachBasicInfo } from "@/features/coaches/queries/useCoachDetails";

import { EditIcon } from "lucide-react";

interface CoachDetailHeaderProps {
	coachId: string;
}

export default function CoachDetailHeader({ coachId }: CoachDetailHeaderProps) {
	const { data: coach } = useCoachBasicInfo(coachId);
	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">
					{coach?.name ? `${coach.name} - Details` : "Team Member Details"}
				</h1>
			</div>
			<Button asChild>
				<Link
					href={`/dashboard/coaches/${coachId}/edit`}
					className="flex items-center gap-2"
				>
					<EditIcon className="mr-[6px] h-4 w-4" />
					Edit Team Member
				</Link>
			</Button>
		</div>
	);
}
