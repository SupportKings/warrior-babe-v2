import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

import type { CoachProfile } from "../types/coach-profile";

interface CoachProfileHeaderProps {
  coach?: CoachProfile;
  permissions?: string[];
}

export default function CoachProfileHeader({
  coach,
  permissions = [],
}: CoachProfileHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="font-medium text-[13px]">
          {coach?.name || "Loading..."}
          {coach && (
            <Badge
              className="ml-2"
              variant={coach.isPremier ? "default" : "secondary"}
            >
              {coach.isPremier ? "Premier" : "Regular"}
            </Badge>
          )}
        </h1>
      </div>
    </div>
  );
}
