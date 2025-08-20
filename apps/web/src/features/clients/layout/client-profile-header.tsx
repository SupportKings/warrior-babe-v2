"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { EditClientModal } from "@/features/clients/modals/EditClientModal";

import { Edit, MessageSquare, Plus, Star, UserPlus } from "lucide-react";

interface ClientProfileHeaderProps {
  client?: {
    id: string;
    first_name: string;
    last_name: string;
    status: string;
  };
}

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        variant: "default" as const,
        color: "bg-green-500",
        textColor: "text-green-700",
        bgColor: "bg-green-100 dark:bg-green-900/20",
      };
    case "paused":
      return {
        variant: "secondary" as const,
        color: "bg-yellow-500",
        textColor: "text-yellow-700",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      };
    case "churned":
      return {
        variant: "destructive" as const,
        color: "bg-red-500",
        textColor: "text-red-700",
        bgColor: "bg-red-100 dark:bg-red-900/20",
      };
    case "offboarded":
      return {
        variant: "outline" as const,
        color: "bg-gray-500",
        textColor: "text-gray-700",
        bgColor: "bg-gray-100 dark:bg-gray-900/20",
      };
    default:
      return {
        variant: "outline" as const,
        color: "bg-gray-400",
        textColor: "text-gray-700",
        bgColor: "bg-gray-100 dark:bg-gray-900/20",
      };
  }
}

export default function ClientProfileHeader({
  client,
}: ClientProfileHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const statusConfig = getStatusConfig(client?.status || "unknown");

  return (
    <>
      <div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger />

          <h1 className="font-medium text-[13px]">
            {client ? `${client.first_name} ${client.last_name}` : "Loading..."}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button variant="outline">
            <MessageSquare className="mr-1 h-3 w-3" />
            Feedback
          </Button>
          <Button variant="outline">
            <Star className="mr-1 h-3 w-3" />
            Win
          </Button>
          <Button variant="outline">
            <Plus className="mr-1 h-3 w-3" />
            NPS
          </Button>
          <Button variant="outline">
            <UserPlus className="mr-1 h-3 w-3" />
            Assign
          </Button>
          <Button variant="default" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
      </div>

      {/* Edit Client Modal */}
      {client && (
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          client={client}
        />
      )}
    </>
  );
}
