"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { CoachDeleteModal } from "@/features/coaches/components/coach-delete-modal";
import { useCoachBasicInfo } from "@/features/coaches/queries/useCoachDetails";
import { deleteCoach } from "@/features/coaches/actions/delete-coach";

import { useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

interface CoachDetailHeaderProps {
	coachId: string;
}

export default function CoachDetailHeader({ coachId }: CoachDetailHeaderProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: coach } = useCoachBasicInfo(coachId);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteCoach(coachId);
			if (result.success) {
				toast.success(result.message || "Team member deleted successfully");
				queryClient.invalidateQueries({ queryKey: ["coaches"] });
				router.push("/dashboard/coaches");
			} else {
				toast.error(result.message || "Failed to delete team member");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the team member");
			console.error("Delete error:", error);
		} finally {
			setIsDeleting(false);
			setIsDeleteModalOpen(false);
		}
	};

	return (
		<>
			<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
				<div className="flex items-center gap-2">
					<SidebarTrigger />
					<BackButton />
					<h1 className="font-medium text-[13px]">
						{coach?.name ? `${coach.name} - Details` : "Team Member Details"}
					</h1>
				</div>
				<Button
					variant="destructive"
					onClick={() => setIsDeleteModalOpen(true)}
					disabled={isDeleting}
					className="flex items-center gap-2"
				>
					<Trash2Icon className="h-4 w-4" />
					Delete Team Member
				</Button>
			</div>

			{coach && (
				<CoachDeleteModal
					coach={{
						id: coach.id,
						name: coach.name,
						user: coach.user,
						team_id: coach.team_id,
						contract_type: coach.contract_type,
						onboarding_date: coach.onboarding_date,
					}}
					open={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
					onConfirm={handleDelete}
				/>
			)}
		</>
	);
}
