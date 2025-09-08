import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import { NoActivityPeriods } from "../empty-states/no-activity-periods";
import { createActivityPeriodColumns } from "../table-columns/activity-period-columns";
import { updateActivityPeriodStatusAction } from "../../actions/updateActivityPeriodStatus";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { coachPaymentQueries } from "../../queries/useCoachPayments";

interface CoachPaymentActivityPeriodsSectionProps {
  coachPaymentId: string;
  activityPeriods: any[];
  setDeleteModal: (modal: any) => void;
}

export function CoachPaymentActivityPeriodsSection({
  coachPaymentId,
  activityPeriods,
  setDeleteModal,
}: CoachPaymentActivityPeriodsSectionProps) {
  const queryClient = useQueryClient();

  const handleStatusChange = async (id: string, active: boolean) => {
	console.log(id, active)
    try {
      const result = await updateActivityPeriodStatusAction({
        id,
        active,
      });

      if (result?.data?.success) {
        toast.success("Activity period status updated");
        // Invalidate the coach payment detail query to refresh the data
        await queryClient.invalidateQueries({
          queryKey: coachPaymentQueries.detail(coachPaymentId),
        });
      } else {
        toast.error("Failed to update activity period status");
      }
    } catch (error) {
      console.error("Error updating activity period status:", error);
      toast.error("Failed to update activity period status");
    }
  };

  const activityPeriodColumns = createActivityPeriodColumns({
    onStatusChange: handleStatusChange,
  });

  const activityPeriodTable = useReactTable({
    data: activityPeriods || [],
    columns: activityPeriodColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!activityPeriods || activityPeriods.length === 0) {
    return <NoActivityPeriods coachPaymentId={coachPaymentId} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Client Activity Periods
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <UniversalDataTable
          table={activityPeriodTable}
          emptyStateMessage="No activity periods found for this coach payment"
        />
      </CardContent>
    </Card>
  );
}
