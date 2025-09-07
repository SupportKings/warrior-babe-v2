import { BackButton } from "@/components/ui/back-button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function WinTagsAddHeader() {
  return (
    <div className="sticky top-0 z-10 flex h-[45px] items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="font-medium text-[13px]">Add Win Tag</h1>
      </div>
    </div>
  );
}
