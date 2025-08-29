import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { CalendarPlusIcon } from "lucide-react";

export default function ClientActivityPeriodHeader() {
	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<h1 className="font-medium text-[13px] ">Client Activity Periods </h1>
			</div>
			<Button asChild>
				<Link
					href="/dashboard/clients/activity-periods/add"
					className="flex items-center gap-2"
				>
					<CalendarPlusIcon className="mr-[6px] h-4 w-4" />
					Add Client Activity Period
				</Link>
			</Button>
		</div>
	);
}
