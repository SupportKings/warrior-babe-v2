import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { Settings, Sliders } from "lucide-react";
import { ProductSettingsDialog } from "../components/product-settings-dialog";
import { SystemSettingsDialog } from "../components/system-settings-dialog";

interface CapacityHeaderProps {
  permissions: any;
  userRole: string;
}

export default function CapacityHeader({ permissions, userRole }: CapacityHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6 ">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="font-medium text-[13px] ">Capacity</h1>
      </div>
      {userRole !== "premiereCoach" && (
        <div className="flex items-center gap-2">
          <SystemSettingsDialog
            trigger={
              <Button size="sm" variant="outline">
                <Sliders className="mr-[6px] h-4 w-4" />
                System Settings
              </Button>
            }
          />
          <ProductSettingsDialog
            trigger={
              <Button size="sm">
                <Settings className="mr-[6px] h-4 w-4" />
                Product Settings
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
