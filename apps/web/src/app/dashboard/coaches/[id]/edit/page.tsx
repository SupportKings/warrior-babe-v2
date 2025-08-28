import Link from "next/link";
import { notFound } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { getCoach } from "@/features/coaches/actions/get-coach";
import { CoachEditForm } from "@/features/coaches/components/coach-edit-form";

import { ArrowLeftIcon } from "lucide-react";

function EditCoachHeader() {
	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<h1 className="font-medium text-[13px]">Edit Team Member</h1>
			</div>
			<Button variant="outline" asChild>
				<Link href="/dashboard/coaches" className="flex items-center gap-2">
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Team Members
				</Link>
			</Button>
		</div>
	);
}

export default async function EditCoachPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	// Fetch the coach data
	const coach = await getCoach(resolvedParams.id);

	if (!coach) {
		notFound();
	}

	return (
		<MainLayout headers={[<EditCoachHeader key="edit-coach-header" />]}>
			<div className="p-6">
				<CoachEditForm coach={coach as any} />
			</div>
		</MainLayout>
	);
}
