"use client";

import Link from "next/link";

import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@/components/animate-ui/components/avatar-group";
import { CategoryBar } from "@/components/charts/categoryBar";
import { ProgressCircle } from "@/components/progressCircle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIconWrapper,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FadeTransition } from "@/components/ui/fade-transition";

import { IconDisplay } from "@/features/icons/components/icon-display";

import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, User, Users } from "lucide-react";
import type { CoachTableRow } from "../../types/coach";
import { formatNPSScore } from "../../utils/calculateNPS";
import { RemoveFromPremierCoachDialog } from "../remove-from-premier-coach-dialog";

const columnHelper = createColumnHelper<CoachTableRow>();

export const getCoachColumns = (userRole?: string) => [
  // Column 1: Coach info (avatar, name, WITHOUT premier badge)
  columnHelper.display({
    id: "coach",
    header: "Coach",
    meta: {
      className:
        "md:sticky bg-background z-10 border-r border-border text-left",
    },
    cell: ({ row }) => {
      const coach = row.original;
      const initials = coach.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={coach.image || undefined} alt={coach.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{coach.name}</div>
            <div className="text-muted-foreground text-sm">{coach.email}</div>
          </div>
        </div>
      );
    },
  }),

  // Column 2: Type (Premier/Regular)
  columnHelper.accessor("type", {
    header: "Type",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const type = row.getValue<"Premier" | "Regular">("type");
      return type === "Premier" ? (
        <Badge variant="default">Premier</Badge>
      ) : (
        <Badge variant="secondary">Regular</Badge>
      );
    },
  }),

  // Column 3: Premier Coach (only shown for regular coaches)
  columnHelper.display({
    id: "premierCoach",
    header: "Premier Coach",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const type = row.original.type;
      const premierCoach = row.original.premierCoach;

      if (type === "Premier") {
        return (
          <FadeTransition transitionKey="premier-type">
            <span className="text-muted-foreground text-sm">-</span>
          </FadeTransition>
        );
      }

      if (!premierCoach) {
        return (
          <FadeTransition transitionKey="no-premier">
            <span className="text-muted-foreground text-sm">None</span>
          </FadeTransition>
        );
      }

      const initials = premierCoach.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      return (
        <FadeTransition transitionKey={premierCoach.id || premierCoach.name}>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={premierCoach.image || undefined}
                alt={premierCoach.name}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-sm">{premierCoach.name}</div>
          </div>
        </FadeTransition>
      );
    },
  }),

  // Column 4: Specialization
  columnHelper.accessor("specialization", {
    header: "Specialization",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const specialization = row.getValue<
        { name: string; icon: string | null } | string
      >("specialization");

      // Handle both old string format and new object format
      const specializationName =
        typeof specialization === "string"
          ? specialization
          : specialization?.name;
      const specializationIcon =
        typeof specialization === "object" ? specialization?.icon : null;

      return (
        <FadeTransition transitionKey={specializationName || "none"}>
          <div className="flex items-center gap-1.5 text-sm">
            {specializationIcon && (
              <IconDisplay
                iconKey={specializationIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            )}
            <span>{specializationName || "-"}</span>
          </div>
        </FadeTransition>
      );
    },
  }),

  // Column 5: Certifications
  columnHelper.display({
    id: "certifications",
    header: "Certifications",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const certifications = row.original.certifications;

      if (!certifications || certifications.length === 0) {
        return <span className="text-muted-foreground text-sm">None</span>;
      }

      // Show max 3 certifications in avatar group
      const visibleCerts = certifications.slice(0, 3);
      const remainingCount = certifications.length - 3;

      // Prepare all avatars including the +X one
      const allAvatars = [
        ...visibleCerts.map((cert) => ({
          id: cert.id,
          icon: cert.icon,
          name: cert.name,
          verified: cert.verified,
          isCount: false,
        })),
        ...(remainingCount > 0
          ? [
              {
                id: "count",
                count: remainingCount,
                isCount: true,
              },
            ]
          : []),
      ];

      return (
        <AvatarGroup className="-space-x-2 h-8">
          {allAvatars.map((item) =>
            item.isCount ? (
              <Avatar key={item.id} className="size-8 ">
                <AvatarFallback className="bg-muted font-medium text-xs">
                  +
                  {
                    (item as { id: string; count: number; isCount: boolean })
                      .count
                  }
                </AvatarFallback>
                <AvatarGroupTooltip>
                  <p className="font-medium">
                    {
                      (item as { id: string; count: number; isCount: boolean })
                        .count
                    }{" "}
                    more certification
                    {(item as { id: string; count: number; isCount: boolean })
                      .count > 1
                      ? "s"
                      : ""}
                  </p>
                </AvatarGroupTooltip>
              </Avatar>
            ) : (
              <Avatar key={item.id} className="size-8 ">
                {(
                  item as {
                    id: string;
                    icon: string | null | undefined;
                    name: string;
                    verified: boolean | null | undefined;
                    isCount: boolean;
                  }
                ).icon ? (
                  <AvatarImage
                    src={
                      (
                        item as {
                          id: string;
                          icon: string | null | undefined;
                          name: string;
                          verified: boolean | null | undefined;
                          isCount: boolean;
                        }
                      ).icon || undefined
                    }
                    alt={
                      (
                        item as {
                          id: string;
                          icon: string | null | undefined;
                          name: string;
                          verified: boolean | null | undefined;
                          isCount: boolean;
                        }
                      ).name
                    }
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-primary font-medium text-white text-xs">
                    {(
                      item as {
                        id: string;
                        icon: string | null | undefined;
                        name: string;
                        verified?: boolean | null;
                        isCount: boolean;
                      }
                    ).name
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                )}
                <AvatarGroupTooltip>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {
                        (
                          item as {
                            id: string;
                            icon: string | null | undefined;
                            name: string;
                            verified?: boolean | null;
                            isCount: boolean;
                          }
                        ).name
                      }
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {(
                        item as {
                          id: string;
                          icon: string | null | undefined;
                          name: string;
                          verified?: boolean | null;
                          isCount: boolean;
                        }
                      ).verified
                        ? "✓ Verified"
                        : "Unverified"}
                    </p>
                  </div>
                </AvatarGroupTooltip>
              </Avatar>
            )
          )}
        </AvatarGroup>
      );
    },
  }),

  // Column 6: Units (capacity)
  columnHelper.display({
    id: "units",
    header: "Units",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const current = row.original.totalUnits;
      const limit = row.original.maxCapacity; // Use dynamic capacity from data

      // Calculate the same ranges as in the KPI box
      const goodRangeLimit = Math.floor(limit * 0.75);
      const mediumRangeLimit = Math.floor(limit * 0.9);

      const values = [
        goodRangeLimit,
        mediumRangeLimit - goodRangeLimit,
        limit - mediumRangeLimit,
      ];

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium">{current}</span>
            <span className="text-muted-foreground">/{limit}</span>
          </div>
          <CategoryBar
            values={values}
            colors={["emerald", "amber", "red"]}
            marker={{
              value: current,
              tooltip: current.toString(),
              showAnimation: true,
            }}
            showLabels={false}
            className="mt-1 h-1.5"
          />
        </div>
      );
    },
  }),

  // Column 7: # Clients (workload metric)
  columnHelper.accessor("activeClients", {
    header: "# Clients",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("activeClients")}</div>;
    },
  }),

  // Column 8: Performance (NPS score)
  columnHelper.display({
    id: "performance",
    header: "NPS",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const npsScore = row.original.averageNPS;
      const formattedScore = formatNPSScore(npsScore);

      // Determine color based on NPS score
      const color =
        npsScore >= 50
          ? "text-green-600"
          : npsScore >= 0
          ? "text-yellow-600"
          : "text-red-600";

      return <div className={`font-medium ${color}`}>{formattedScore}</div>;
    },
  }),

  // Column 9: Goals Hit Rate
  columnHelper.accessor("goalsHitRate", {
    header: "Goals Hit",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const rate = row.getValue<number>("goalsHitRate");
      const variant = rate >= 85 ? "success" : rate >= 70 ? "warning" : "error";

      return (
        <div className="flex items-center gap-2">
          <ProgressCircle
            value={rate}
            max={100}
            variant={variant}
            radius={14}
            strokeWidth={3}
            showAnimation={true}
          />
          <span className="font-medium text-[11px]">{rate}%</span>
        </div>
      );
    },
  }),

  // Column 10: Renewal Rate
  columnHelper.accessor("renewalRate", {
    header: "Renewal Rate",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const rate = row.getValue<number>("renewalRate");
      const variant = rate >= 80 ? "success" : rate >= 60 ? "warning" : "error";

      return (
        <div className="flex items-center gap-2">
          <ProgressCircle
            value={rate}
            max={100}
            variant={variant}
            radius={14}
            strokeWidth={3}
            showAnimation={true}
          />
          <span className="font-medium text-[11px]">{rate}%</span>
        </div>
      );
    },
  }),

  // Column 11: Open Tickets (operational)
  columnHelper.accessor("openTickets", {
    header: "Open Tickets",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const count = row.getValue<number>("openTickets");
      const variant =
        count === 0 ? "secondary" : count > 3 ? "destructive" : "default";
      return (
        <Link
          href={`/dashboard/tickets/all?filters=[{"columnId":"assignee","type":"option","operator":"is","values":["${row.original.id}"]}]`}
        >
          <Badge variant={variant}>{count}</Badge>
        </Link>
      );
    },
  }),

  // Column 12: Actions
  columnHelper.display({
    id: "actions",
    meta: {
      className:
        "md:sticky md:right-0 bg-background z-10 border-l border-border text-left",
    },
    cell: ({ row }) => {
      const coach = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <IconDisplay
                iconKey="more-horizontal"
                className="h-4 w-4"
                fallback={<MoreHorizontal className="h-4 w-4" />}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/coaches/${coach.id}`}>
                <DropdownMenuIconWrapper>
                  <IconDisplay
                    iconKey="user"
                    className="h-4 w-4"
                    fallback={<User className="h-4 w-4" />}
                  />
                </DropdownMenuIconWrapper>
                View Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/clients?filters=[{"columnId":"coach","type":"option","operator":"is","values":["${coach.id}"]}]`}
              >
                <DropdownMenuIconWrapper>
                  <IconDisplay
                    iconKey="users"
                    className="h-4 w-4"
                    fallback={<Users className="h-4 w-4" />}
                  />
                </DropdownMenuIconWrapper>
                View Clients
              </Link>
            </DropdownMenuItem>
            {/*  {userRole === "premiereCoach" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    console.log(
                      `Reassign coach ${coach.id} - Feature coming soon`
                    );
                  }}
                >
                  <DropdownMenuIconWrapper>
                    <IconDisplay
                      iconKey="user-cog"
                      className="h-4 w-4"
                      fallback={<UserCog className="h-4 w-4" />}
                    />
                  </DropdownMenuIconWrapper>
                  Reassign Coach
                </DropdownMenuItem>
              </>
            )} */}

            {/* Show remove from premier coach option only for regular coaches with a premier coach */}
            {coach.type === "Regular" && coach.premierCoach && (
              <>
                <DropdownMenuSeparator />
                <RemoveFromPremierCoachDialog
                  coachId={coach.id}
                  coachName={coach.name}
                  premierCoachName={coach.premierCoach.name}
                  onSuccess={() => {}}
                />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];

// For backward compatibility, export the default columns
export const coachColumns = getCoachColumns();
