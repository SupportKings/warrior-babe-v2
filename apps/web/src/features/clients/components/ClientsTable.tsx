"use client";

import { useState } from "react";

import { usePermissions } from "@/hooks/useUser";

import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@/components/animate-ui/components/avatar-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinearProgress } from "@/components/ui/progress-ring";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { StartOnboardingDialog } from "@/features/onboarding/components/StartOnboardingDialog";

import { format } from "date-fns";
import {
  Edit,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Package,
  Users,
} from "lucide-react";

interface ClientsTableProps {
  clients: any[];
  onEdit: (client: any) => void;
}

export function ClientsTable({ clients, onEdit }: ClientsTableProps) {
  const { canEditClients, canAssignCoaches } = usePermissions();
  const [onboardingClient, setOnboardingClient] = useState<any>(null);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400";
      case "onboarding":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
      case "paused":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "churned":
        return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handleRowClick = (clientId: string) => {
    window.location.href = `/dashboard/clients/${clientId}`;
  };

  return (
    <>
      <div className="scrollbar-hide overflow-x-auto overscroll-x-none rounded-md border border-border [-ms-overflow-style:none] [scrollbar-width:none] md:border-r md:border-l [&::-webkit-scrollbar]:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Client</TableHead>
              <TableHead className="text-left">Status</TableHead>
              <TableHead className="text-left">Product</TableHead>
              <TableHead className="text-left">Team</TableHead>
              <TableHead className="text-left">Progress</TableHead>
              <TableHead className="text-left">Start Date</TableHead>
              <TableHead className="text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                onClick={() => handleRowClick(client.id)}
                className="group h-[50px] cursor-pointer select-text hover:bg-muted/50"
              >
                {/* Client Info */}
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        {client.first_name.charAt(0)}
                        {client.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-foreground text-sm transition-colors group-hover:text-primary">
                          {client.first_name} {client.last_name}
                        </p>
                        {client.company && (
                          <Badge
                            variant="outline"
                            className="font-medium text-xs"
                          >
                            {client.company}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-muted-foreground text-xs">
                        {client.email}
                      </p>
                      {client.position && (
                        <p className="truncate text-muted-foreground/80 text-xs">
                          {client.position}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(
                      client.status
                    )} px-2 py-1 font-medium text-xs tracking-wide`}
                  >
                    {client.status?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                </TableCell>

                {/* Product */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-pink-400" />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {client.product?.name || "Unknown"}
                      </p>
                      {client.product?.description && (
                        <p className="truncate text-muted-foreground text-xs">
                          {client.product.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Team */}
                <TableCell>
                  {!client.assignments || client.assignments.length === 0 ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">No team assigned</span>
                    </div>
                  ) : (
                    <AvatarGroup className="-space-x-2 h-8">
                      {client.assignments?.map(
                        (assignment: any, index: number) => {
                          const initials =
                            assignment?.user?.name?.charAt(0) || "?";

                          return (
                            <Avatar key={`${client.id}-assignment-${index}`}>
                              <AvatarImage
                                src={assignment?.user?.image || undefined}
                                alt={assignment?.user?.name}
                              />
                              <AvatarFallback>{initials}</AvatarFallback>
                              <AvatarGroupTooltip>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={assignment?.user?.image || undefined}
                                      alt={assignment?.user?.name}
                                    />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-sm">
                                      {assignment?.user?.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`h-2 w-2 rounded-full ${
                                          assignment?.assignment_type ===
                                          "coach"
                                            ? "bg-purple-500"
                                            : "bg-blue-500"
                                        }`}
                                      />
                                      <span className="text-muted-foreground text-xs capitalize">
                                        {assignment?.assignment_type}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </AvatarGroupTooltip>
                            </Avatar>
                          );
                        }
                      )}
                    </AvatarGroup>
                  )}
                </TableCell>

                {/* Onboarding Progress */}
                <TableCell>
                  <div className="space-y-3">
                    {(() => {
                      const completedCheckpoints =
                        client.client_onboarding_progress?.filter(
                          (checkpoint: any) => checkpoint.is_completed
                        ).length;
                      const totalCheckpoints =
                        client.client_onboarding_progress?.length;
                      const progress =
                        (completedCheckpoints / totalCheckpoints) * 100;
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-muted-foreground text-xs">
                              {completedCheckpoints}/{totalCheckpoints} tasks
                            </span>
                            <span className="font-bold text-foreground text-sm">
                              {progress ? progress : 0}%
                            </span>
                          </div>
                          <div className="relative">
                            <LinearProgress
                              progress={progress ? progress : 0}
                              height={6}
                              animated={true}
                              color="green"
                              backgroundColor="#d6d6d6b8"
                              className="rounded-full"
                            />
                          </div>
                          {/*           <div className="text-muted-foreground text-xs">
                            {progress === 100 ? (
                              <span className="font-medium text-green-600">
                                Completed
                              </span>
                            ) : progress > 75 ? (
                              <span className="font-medium text-blue-600">
                                Almost done
                              </span>
                            ) : progress > 25 ? (
                              <span className="font-medium text-yellow-600">
                                In progress
                              </span>
                            ) : (
                              <span className="font-medium text-red-600">
                                Just started
                              </span>
                            )}
                          </div> */}
                        </>
                      );
                    })()}
                  </div>
                </TableCell>

                {/* Start Date */}
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <p className="font-medium text-foreground text-sm">
                      {format(new Date(client.start_date), "MMM d, yyyy")}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {format(new Date(client.start_date), "EEEE")}
                    </p>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 cursor-pointer p-0 outline-none transition-colors hover:bg-black/10"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/dashboard/clients/${client.id}`;
                        }}
                        className="gap-3"
                      >
                        <Eye className="h-4 w-4" />
                        Open Client Details
                      </DropdownMenuItem>
                      {canEditClients && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(client);
                          }}
                          className="gap-3"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Client
                        </DropdownMenuItem>
                      )}
                      {client.platform_link && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(client.platform_link!, "_blank");
                          }}
                          className="gap-3"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Platform
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <StartOnboardingDialog
        open={!!onboardingClient}
        onOpenChange={(open) => !open && setOnboardingClient(null)}
        preselectedClient={onboardingClient}
      />
    </>
  );
}
