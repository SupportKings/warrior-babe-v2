"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { format } from "date-fns";
import {
  Calendar,
  Link as LinkIcon,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

interface ClientProfileSidebarProps {
  client: any;
}

export default function ClientProfileSidebar({
  client,
}: ClientProfileSidebarProps) {
  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return "??";
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "default";
      case "paused":
        return "secondary";
      case "churned":
        return "destructive";
      case "offboarded":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="h-full space-y-6">
      {/* Profile Section */}
      <div className="flex flex-col gap-2 border-b p-6">
        <div className="flex flex-col gap-2.5">
          {/* Name and Basic Info */}
          <div className="flex w-full flex-row gap-6">
            <div className="flex min-w-0 grow flex-col gap-3">
              <div className="flex min-w-0 flex-row items-center justify-between gap-1">
                <div className="flex min-w-0 grow flex-row items-center">
                  <div className="flex min-w-0 flex-row items-center gap-2.5">
                    <Avatar className="h-11 w-11">
                      <AvatarImage
                        src={client?.profile_picture}
                        alt={`${client?.first_name} ${client?.last_name}`}
                      />
                      <AvatarFallback className="text-lg">
                        {getInitials(
                          client?.first_name || "",
                          client?.last_name || ""
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-lg">
                        {client?.first_name || "Unknown"}{" "}
                        {client?.last_name || "Client"}
                      </span>
                      <div className="flex flex-row items-baseline gap-1.5">
                        <span className="font-[450] text-[13px] text-muted-foreground">
                          {client?.email || "No email"}
                        </span>
                        {client?.status && (
                          <>
                            <span className="font-[450] text-[13px] text-muted-foreground">
                              ⋅
                            </span>
                            <Badge
                              variant={getStatusVariant(client.status)}
                              className="h-auto px-1.5 py-0 text-[11px]"
                            >
                              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Structured Info Fields */}
          <div className="mt-2 flex flex-col gap-2">
            {/* Member Since */}
            <div className="flex flex-row items-center gap-2">
              <div className="flex w-[90px] shrink-0 flex-row items-center">
                <span className="text-left font-[450] text-muted-foreground text-xs">
                  Member since
                </span>
              </div>
              <div className="flex min-w-0 flex-initial flex-col">
                <div className="flex min-h-7 flex-row items-center px-1.5 py-[3px]">
                  <span className="font-medium text-[13px]">
                    {client?.start_date
                      ? format(new Date(client.start_date), "MMM yyyy")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Product */}
            {client?.product && (
              <div className="flex flex-row items-center gap-2">
                <div className="flex w-[90px] shrink-0 flex-row items-center">
                  <span className="text-left font-[450] text-muted-foreground text-xs">
                    Product
                  </span>
                </div>
                <div className="flex min-w-0 flex-initial flex-col">
                  <div className="flex min-h-7 flex-row items-center px-1.5 py-[3px]">
                    <span className="font-medium text-[13px]">
                      {client.product.name}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Actions */}
            <div className="mt-2 flex gap-2">
              {client?.email && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8"
                  asChild
                >
                  <a href={`mailto:${client.email}`}>
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                    Email
                  </a>
                </Button>
              )}
              {client?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8"
                  asChild
                >
                  <a href={`tel:${client.phone}`}>
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    Call
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Assignments */}
        <div className="border-b px-6 pb-6">
          <h3 className="mb-4 font-semibold text-base">Assignments</h3>
          <div className="space-y-3">
            {/* Coach Assignment */}
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <div className="font-medium text-sm mb-2">Assigned Coach</div>
              {(() => {
                const coach = client?.assignments?.find(
                  (a: any) => a.assignment_type === "coach" && !a.end_date
                );
                return coach ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={coach.user?.image} />
                      <AvatarFallback className="text-xs">
                        {coach.user?.name
                          ? coach.user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium text-sm">
                        {coach.user?.name || "Unknown Coach"}
                      </span>
                      <span className="text-muted-foreground text-xs ml-2">
                        Since{" "}
                        {coach.start_date
                          ? format(new Date(coach.start_date), "MMM yyyy")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Not assigned
                  </span>
                );
              })()}
            </div>

            {/* CSC Assignment */}
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <div className="font-medium text-sm mb-2">Assigned CSC</div>
              {(() => {
                const csc = client?.assignments?.find(
                  (a: any) => a.assignment_type === "csc" && !a.end_date
                );
                return csc ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={csc.user?.image} />
                      <AvatarFallback className="text-xs">
                        {csc.user?.name
                          ? csc.user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium text-sm">
                        {csc.user?.name || "Unknown CSC"}
                      </span>
                      <span className="text-muted-foreground text-xs ml-2">
                        Since{" "}
                        {csc.start_date
                          ? format(new Date(csc.start_date), "MMM yyyy")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Not assigned
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Onboarding */}
        <div className="border-b px-6 pb-6">
          <h3 className="mb-4 font-semibold text-base">Onboarding</h3>
          <div className="space-y-3">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm">Progress</span>
                <span className="font-medium text-sm">
                  {client?.client_onboarding_progress?.some(
                    (p: any) => p.is_completed
                  )
                    ? "100%"
                    : "0%"}
                </span>
              </div>
              <Progress
                value={
                  client?.client_onboarding_progress?.some(
                    (p: any) => p.is_completed
                  )
                    ? 100
                    : 0
                }
                className="h-2"
              />
              <div className="mt-1 text-muted-foreground text-xs">
                {client?.client_onboarding_progress?.some(
                  (p: any) => p.is_completed
                )
                  ? `Completed ${
                      client.client_onboarding_progress.find(
                        (p: any) => p.is_completed
                      )?.completed_at
                        ? format(
                            new Date(
                              client.client_onboarding_progress.find(
                                (p: any) => p.is_completed
                              ).completed_at
                            ),
                            "MMM dd, yyyy"
                          )
                        : ""
                    }`
                  : "In progress"}
              </div>
            </div>

            {/* Onboarding Notes */}
            {client?.onboarding_notes && (
              <div className="mt-4">
                <div className="font-medium text-sm mb-1">Notes</div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  {client.onboarding_notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Information */}
        <div className="px-6 pb-6">
          <h3 className="mb-4 font-semibold text-base">Key Information</h3>
          <div className="space-y-3">
            {/* Renewal Date */}
            {client?.renewal_date && (
              <div className="flex flex-row items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Renewal Date</div>
                  <div className="text-muted-foreground text-xs">
                    {format(new Date(client.renewal_date), "MMM dd, yyyy")} (
                    {Math.ceil(
                      (new Date(client.renewal_date).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days)
                  </div>
                </div>
              </div>
            )}

            {/* Platform Link */}
            {client?.platform_link && (
              <div className="flex flex-row items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-sm"
                    asChild
                  >
                    <a
                      href={client.platform_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Platform →
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}