import { BackButton } from "@/components/ui/back-button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function CoachTeamsAddHeader() {
	return (
		<div className="sticky top-0 z-10 flex h-[45px] items-center gap-3 border-b bg-background px-6">
			<SidebarTrigger />
			<BackButton />
			<div className="flex-1">
				<h1 className="font-medium text-[13px]">Add Coach Team</h1>
			</div>
		</div>
	);
}
