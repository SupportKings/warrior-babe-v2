import { SidebarTrigger } from "@/components/ui/sidebar";
import { BackButton } from "@/components/ui/back-button";

export default function ClientAddHeader() {
	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton/>
				<h1 className="font-medium text-[13px]">Add New Client</h1>
			</div>
			
		</div>
	);
}