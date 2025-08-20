import { redirect } from "next/navigation";

import { 
  admin, 
  coach, 
  user,
  premiereCoach,
  cpo,
  csManager,
  csRep,
  csc,
  finance,
  billingAdmin,
  salesRep
} from "@/lib/permissions";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { CommandBar } from "@/features/commandpallette/components/commandBar";
import { CommandProvider } from "@/features/commandpallette/components/commandProvider";

import { getUser } from "@/queries/getUser";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  // Get the user's role from the session
  const userRole = session.user.role || "user";

  // Map role names to our permission objects
  const rolePermissions = {
    admin,
    user,
    coach,
    premiereCoach,
    cpo,
    csManager,
    csRep,
    csc,
    finance,
    billingAdmin,
    salesRep,
  };

  const rawRolePermissions =
    rolePermissions[userRole as keyof typeof rolePermissions] || user;

  // Extract only the statements data (not the functions) for client component
  const permissionStatements = rawRolePermissions.statements;

  //betterauth recomends to do a extra check outside of middleware
  return (
    <CommandProvider permissions={permissionStatements}>
      <SidebarProvider>
        <AppSidebar
          variant="inset"
          session={session}
          rawPermissions={permissionStatements}
        />

        <SidebarInset className="overflow-x-hidden">
          {/* <div className="m-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <h3 className="mb-2 font-bold">Debug: User Role Permissions</h3>
          <p className="mb-2 text-sm">Role: {userRole}</p>
          <pre className="overflow-auto rounded bg-white p-2 text-xs dark:bg-gray-900">
            {JSON.stringify(permissionStatements, null, 2)}
          </pre>
        </div> */}

          {children}
          <CommandBar />
        </SidebarInset>
      </SidebarProvider>
    </CommandProvider>
  );
}
