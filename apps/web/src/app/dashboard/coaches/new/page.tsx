import Link from "next/link";

import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CoachForm } from "@/features/coaches/components/coach-form";

import { ArrowLeftIcon } from "lucide-react";

function AddTeamMemberHeader() {
	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<h1 className="font-medium text-[13px]">Add New Team Member</h1>
			</div>
			<Button variant="outline" asChild>
				<Link href="/dashboard/coaches" className="flex items-center gap-2">
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Team
				</Link>
			</Button>
		</div>
	);
}

export default async function AddTeamMemberPage() {
	return (
		<MainLayout headers={[<AddTeamMemberHeader key="add-team-member-header" />]}>
			<div className="p-6">
				<CoachForm />
			</div>
		</MainLayout>
	);
}