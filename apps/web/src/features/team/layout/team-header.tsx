import type { AnyRoleStatements } from "@/lib/permissions";

import { SidebarTrigger } from "@/components/ui/sidebar";

import AddUserDialog from "../components/add-user-dialog";

interface TeamHeaderProps {
  permissions: AnyRoleStatements;
}

export default function TeamHeader({ permissions }: TeamHeaderProps) {
  // Check if user has admin permissions to manage users
  const canManageUsers = Array.isArray(permissions)
    ? false
    : "user" in permissions && permissions.user?.includes("create");

  return (
    <div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="font-medium text-[13px] ">Team</h1>
      </div>
      {canManageUsers && <AddUserDialog />}
    </div>
  );
}
