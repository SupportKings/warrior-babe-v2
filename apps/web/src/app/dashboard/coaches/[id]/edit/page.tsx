import { notFound } from "next/navigation";
import Link from "next/link";

import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CoachEditForm } from "@/features/coaches/components/coach-edit-form";
import { getCoach } from "@/features/coaches/actions/get-coach";
import { getAllPotentialTeamLeaders } from "@/features/coaches/actions/get-coach-teams";

import { ArrowLeftIcon } from "lucide-react";

function EditCoachHeader() {
  return (
    <div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="font-medium text-[13px]">Edit Coach</h1>
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

export default async function EditCoachPage(params: any) {
  // Fetch the coach data
  const coach = await getCoach(params.id);

  if (!coach) {
    notFound();
  }

  // Fetch potential team leaders for the dropdown
  const teams = await getAllPotentialTeamLeaders();

  return (
    <MainLayout headers={[<EditCoachHeader key="edit-coach-header" />]}>
      <div className="p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Edit Coach
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update the coach information below
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <CoachEditForm coach={coach as any} teams={teams} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
