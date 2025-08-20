"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

import { ClientTabs } from "@/features/clients/components/ClientTabs";
import ClientProfileSidebar from "@/features/clients/components/client-profile-sidebar";
import { useClient } from "@/features/clients/queries";

import { AlertCircle } from "lucide-react";

interface ClientProfileContentProps {
  clientId: string;
}

export function ClientProfileContent({ clientId }: ClientProfileContentProps) {
  const { data: client, isLoading, error } = useClient(clientId);

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="space-y-6 p-6">
              <LoadingSkeleton type="cards" />
            </div>
          </div>
        </div>
        <div className="h-full w-[430px] border-l bg-card p-6">
          <LoadingSkeleton type="cards" />
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex h-full items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load client profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-6">
            {/* Tabs Content */}
            <ClientTabs />
          </div>
        </div>
      </div>

      {/* Sidebar - Fixed height */}
      <div className="h-full w-[430px] overflow-y-auto border-l bg-card">
        <ClientProfileSidebar client={client} />
      </div>
    </div>
  );
}