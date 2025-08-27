import Link from "next/link";

import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CoachForm } from "@/features/coaches/components/coach-form";
import { getAllPotentialTeamLeaders } from "@/features/coaches/actions/get-coach-teams";

import { ArrowLeftIcon } from "lucide-react";

function AddCoachHeader() {
	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<h1 className="font-medium text-[13px]">Add New Coach</h1>
			</div>
			<Button variant="outline" asChild>
				<Link href="/dashboard/coaches" className="flex items-center gap-2">
					<ArrowLeftIcon className="h-4 w-4" />
					Back to Coaches
				</Link>
			</Button>
		</div>
	);
}

export default async function AddCoachPage() {
	// Fetch potential team leaders for the dropdown
	const teams = await getAllPotentialTeamLeaders();
	
	return (
		<MainLayout headers={[<AddCoachHeader key="add-coach-header" />]}>
			<div className="p-6">
				<div className="mx-auto max-w-2xl">
					<div className="mb-6">
						<h2 className="text-2xl font-semibold tracking-tight">Create New Coach</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Fill in the information below to create a new coach profile
						</p>
					</div>
					<div className="rounded-lg border bg-card p-6">
						<CoachForm teams={teams} />
					</div>
				</div>
			</div>
		</MainLayout>
	);
}