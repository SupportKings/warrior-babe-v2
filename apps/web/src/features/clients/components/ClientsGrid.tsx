"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LinearProgress } from "@/components/ui/progress-ring";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { format } from "date-fns";
import { Calendar, Edit, ExternalLink, Package, User } from "lucide-react";

interface ClientsGridProps {
  clients: any[];
  onEdit: (client: any) => void;
}

export function ClientsGrid({ clients, onEdit }: ClientsGridProps) {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400";
      case "paused":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "churned":
        return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handleCardClick = (clientId: string) => {
    window.location.href = `/dashboard/clients/${clientId}`;
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="h-full cursor-pointer"
            onClick={() => handleCardClick(client.id)}
          >
            <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-background to-muted/20 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="flex-shrink-0 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar>
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        {client.first_name.charAt(0)}
                        {client.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-foreground">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="truncate text-muted-foreground text-sm">
                        {client.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={getStatusColor(client.status)}
                    >
                      {client.status || "Unknown"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(client);
                      }}
                      className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit client</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Product Info */}
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm">
                    {client.product?.name ||
                      client.product?.name ||
                      "No product"}
                    {client.product?.description &&
                      ` - ${client.product?.description}`}
                  </span>
                </div>

                {/* Start Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(client.start_date), "MMM d, yyyy")}
                  </span>
                </div>

                {/* Team Assignments */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {(() => {
                      return (
                        client.client_assignments &&
                        client.client_assignments.map(
                          (assignment: any, index: number) => (
                            <Tooltip
                              key={`${
                                assignment.user?.id ||
                                assignment.user?.name ||
                                index
                              }`}
                            >
                              <TooltipTrigger>
                                <Avatar>
                                  <AvatarImage
                                    src={assignment.user.image || undefined}
                                  />
                                  <AvatarFallback>
                                    {assignment.user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-medium">
                                    {assignment.user.name}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {assignment.assignment_type}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        )
                      );
                    })()}
                  </div>
                </div>

                {/* Onboarding Progress */}
                <div className="space-y-2">
                  {(() => {
                    // Mock progress for now - this should come from onboarding data
                    const mockProgress = Math.floor(Math.random() * 101);
                    const mockCompleted = Math.floor(mockProgress / 10);
                    const mockTotal = 10;

                    return (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Onboarding
                          </span>
                          <span className="font-medium">{mockProgress}%</span>
                        </div>
                        <LinearProgress
                          progress={mockProgress}
                          height={6}
                          animated={false}
                        />
                        <p className="text-muted-foreground text-xs">
                          {mockCompleted} of {mockTotal} tasks completed
                        </p>
                      </>
                    );
                  })()}
                </div>

                {/* Platform Link */}
                {client.platform_link && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(client.platform_link!, "_blank");
                      }}
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Platform
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
