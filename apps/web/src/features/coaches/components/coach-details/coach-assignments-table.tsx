"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import { useUniversalTable } from "@/components/universal-data-table/hooks/use-universal-table";

import { Users } from "lucide-react";
import { clientAssignmentColumns } from "./columns/client-assignments-columns";

type ClientAssignment = {
  id: string;
  assignment_type: string;
  start_date: string;
  end_date: string | null;
  client: {
    id: string;
    name: string;
    email: string;
  } | null;
};

interface CoachAssignmentsTableProps {
  assignments: ClientAssignment[];
}

/**
 * Renders a card containing a data table of client assignments for a team member, or a placeholder when none exist.
 *
 * The component configures a UniversalDataTable using the provided `assignments` and displays it inside a Card.
 * If `assignments` is empty or undefined, a centered "No Client Assignments" placeholder is shown instead.
 *
 * @param assignments - Array of client assignment records to display. Passing `undefined` or an empty array will render the placeholder.
 * @returns A JSX element containing the assignments card and either the data table or the empty-state UI.
 */
export function CoachAssignmentsTable({ assignments }: CoachAssignmentsTableProps) {
  const tableConfig = useUniversalTable<ClientAssignment>({
    data: assignments || [],
    totalCount: assignments?.length || 0,
    columns: clientAssignmentColumns,
    columnsConfig: [], // No filters needed for detail view
    filters: [],
    onFiltersChange: () => {},
    enableSelection: false,
    pageSize: assignments?.length > 10 ? 10 : assignments?.length || 1,
    serverSide: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Client Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assignments && assignments.length > 0 ? (
          <UniversalDataTable
            table={tableConfig.table}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No Client Assignments</h3>
            <p className="text-muted-foreground">
              This team member has no client assignments yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}