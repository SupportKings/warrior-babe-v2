"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { coachQueries } from "../queries/coaches";
import { CoachesDataTable } from "./table/data-table";
import { TableSkeleton } from "./table/table-skeleton";
import { coachColumns } from "./table/columns";
import { AddTeamMemberDialog } from "./add-team-member-dialog";

interface TeamMembersTableProps {
  coachId: string;
}

export function TeamMembersTable({ coachId }: TeamMembersTableProps) {
  const { data: teamMembers, isLoading } = useQuery(
    coachQueries.allCoaches(undefined, { premiereCoachId: coachId })
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
        </CardTitle>
        <AddTeamMemberDialog premierCoachId={coachId} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton numCols={coachColumns.length} numRows={5} />
        ) : teamMembers && teamMembers.length > 0 ? (
          <CoachesDataTable data={teamMembers} hideColumns={["premierCoach"]} />
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No team members found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}