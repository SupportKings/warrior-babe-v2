"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { Plus } from "lucide-react";

interface ClientsHeaderProps {
  permissions: any;
  onAddClient?: () => void;
}

export default function ClientsHeader({
  permissions,
  onAddClient,
}: ClientsHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-header border-b bg-background px-4 py-2 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="font-medium text-[13px] ">Clients </h1>
      </div>
      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* Add Client Button */}

        <Button size="sm" className="" onClick={onAddClient}>
          <Plus className="mr-1 h-3 w-3" />
          Add Client
        </Button>
      </div>
    </div>
  );
}
