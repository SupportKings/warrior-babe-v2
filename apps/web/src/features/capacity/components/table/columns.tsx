"use client";

import Link from "next/link";

import { CategoryBar } from "@/components/charts/categoryBar";
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
import { CircleGaugeIcon, MoreHorizontal, Users } from "lucide-react";
import type { CoachTableRow } from "../../../coaches/types/coach";

const columnHelper = createColumnHelper<CoachTableRow>();

export const getCapacityColumns = (userRole?: string) => [
  // Column 1: Coach info (avatar, name, email) - Sticky Left
  columnHelper.display({
    id: "coach",
    header: "Coach",
    meta: {
      className:
        "md:sticky bg-background z-10 border-r border-border text-left md:left-0",
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

  // Column 3: Specialization
  columnHelper.accessor("specialization", {
    header: "Specialization",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const specialization = row.getValue<
        { name: string; icon: string | null } | string
      >("specialization");

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

  // Column 4: Units (Enhanced capacity visualization)
  columnHelper.display({
    id: "units",
    header: "Units",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      const current = row.original.totalUnits;
      const limit = row.original.maxCapacity;

      // Calculate capacity ranges
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

  // Column 5: # Clients
  columnHelper.accessor("activeClients", {
    header: "# Clients",
    meta: { className: "text-left" },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("activeClients")}</div>;
    },
  }),

  // Column 7: Actions (Sticky Right)
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
                  <CircleGaugeIcon className="h-4 w-4" />
                </DropdownMenuIconWrapper>
                Change Capacity
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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];

// For backward compatibility
export const capacityColumns = getCapacityColumns();
