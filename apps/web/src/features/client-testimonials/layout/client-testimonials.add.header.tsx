import { BackButton } from "@/components/ui/back-button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function ClientTestimonialsAddHeader() {
	return (
		<header className="sticky top-0 z-10 flex h-[45px] items-center justify-between border-b bg-background px-6">
			<div className="flex items-center gap-4">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">Add Client Testimonial</h1>
			</div>
		</header>
	);
}