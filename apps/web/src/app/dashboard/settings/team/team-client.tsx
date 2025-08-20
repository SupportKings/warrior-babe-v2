"use client";

import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import ChangeRoleDialog from "@/features/team/components/change-role-dialog";
import RemoveUserDialog from "@/features/team/components/remove-user-dialog";
import { RoleGroup } from "@/features/team/components/role-group";
import type { UserWithRole } from "@/features/team/queries/getUsers";
import { useUsers } from "@/features/team/queries/useUsers";

function TeamSkeleton() {
  // Create skeleton data with unique IDs // to avoid biome error
  const skeletonRoles = ["admin", "member", "viewer"].map((role, idx) => ({
    id: role,
    userCount: 2 + idx,
  }));

  return (
    <div className="h-screen">
      {/* Render 3 skeleton role groups */}
      {skeletonRoles.map((roleData) => (
        <div key={roleData.id} className="mb-4">
          {/* Role Header Skeleton */}
          <div className="h-9 w-full border-b-black">
            <div className="flex h-full min-w-0 items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap border-b-black py-0 pr-6 pl-0 shadow-[lch(88.679_0_282.863)_0_0.5px_0,lch(88.679_0_282.863)_0_-0.5px_0] outline-offset-[-3px] transition-[box-shadow,background-color] duration-[0.15s,0s] [background:linear-gradient(90deg,lch(96.667_0_282.863)_0,lch(96.667_0_282.863)_100%),lch(96.667_0_282.863)] dark:shadow-none dark:[background:linear-gradient(90deg,lch(9.934_1.648_271.985)_0,lch(8.3_1.867_272)_100%),lch(8.3_1.867_272)]">
              {/* Collapse Button Skeleton */}
              <div className="flex flex-row">
                <Skeleton className="h-6 w-6 translate-x-[3px]" />
              </div>

              {/* Role Name and Count Skeleton */}
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-row">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex shrink-0 flex-row">
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          </div>

          {/* Users List Skeleton */}
          <div className="flex flex-col">
            {Array.from({ length: roleData.userCount }).map((_, userIdx) => (
              <div
                key={`${roleData.id}-user-${userIdx}`}
                className="flex h-9 items-center justify-between border-b bg-card px-4"
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar Skeleton */}
                  <Skeleton className="h-6 w-6 rounded-full" />

                  {/* Name Skeleton */}
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-24" />
                  </div>

                  {/* Email and Join Date Skeleton */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>

                {/* Menu Button Skeleton */}
                <Skeleton className="h-6 w-6" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface TeamClientProps {
  currentUserId: string;
  permissions: any;
  impersonatedBy?: string | null;
}

export default function TeamClient({
  currentUserId,
  permissions,
  impersonatedBy,
}: TeamClientProps) {
  const { data, isLoading } = useUsers();
  const users = data?.users || [];

  const [changeRoleDialog, setChangeRoleDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    currentRole: string;
  }>({ open: false, userId: "", userName: "", currentRole: "" });

  const [removeUserDialog, setRemoveUserDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: "", userName: "" });

  const handleChangeRole = (
    userId: string,
    userName: string,
    currentRole: string
  ) => {
    setChangeRoleDialog({
      open: true,
      userId,
      userName,
      currentRole,
    });
  };

  const handleRemoveUser = (userId: string, userName: string) => {
    setRemoveUserDialog({
      open: true,
      userId,
      userName,
    });
  };

  const groupUsersByRole = (users: UserWithRole[]) => {
    const grouped = users.reduce((acc, user) => {
      const role = user.role || "user";
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(user);
      return acc;
    }, {} as Record<string, UserWithRole[]>);

    return grouped;
  };

  if (isLoading) {
    return <TeamSkeleton />;
  }

  const groupedUsers = groupUsersByRole(users);

  // Sort the role groups alphabetically
  const sortedRoleGroups = Object.entries(groupedUsers).sort(
    ([roleA], [roleB]) => roleA.localeCompare(roleB)
  );

  return (
    <>
      <div className="h-screen">
        {sortedRoleGroups.map(([role, roleUsers]) => (
          <RoleGroup
            key={role}
            role={role}
            users={roleUsers}
            onChangeRole={handleChangeRole}
            onRemoveUser={handleRemoveUser}
            currentUserId={currentUserId}
            permissions={permissions}
            impersonatedBy={impersonatedBy}
          />
        ))}
      </div>

      <ChangeRoleDialog
        open={changeRoleDialog.open}
        onOpenChange={(open) =>
          setChangeRoleDialog((prev) => ({ ...prev, open }))
        }
        userId={changeRoleDialog.userId}
        userName={changeRoleDialog.userName}
        currentRole={changeRoleDialog.currentRole}
      />

      <RemoveUserDialog
        open={removeUserDialog.open}
        onOpenChange={(open) =>
          setRemoveUserDialog((prev) => ({ ...prev, open }))
        }
        userId={removeUserDialog.userId}
        userName={removeUserDialog.userName}
      />
    </>
  );
}
