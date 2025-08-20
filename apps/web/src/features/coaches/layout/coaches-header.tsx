import type { AnyRoleStatements } from "@/lib/permissions";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { UserRoundPlusIcon } from "lucide-react";
import AddCoachDialog from "../components/add-coach-dialog";

interface CoachesHeaderProps {
  permissions: AnyRoleStatements;
}

export default function CoachesHeader({ permissions }: CoachesHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="font-medium text-[13px] ">Coaches </h1>
      </div>
      <AddCoachDialog
        trigger={
          <Button>
            <UserRoundPlusIcon className="mr-[6px] h-4 w-4" />
            Add Coach
          </Button>
        }
      />
    </div>
  );
}
