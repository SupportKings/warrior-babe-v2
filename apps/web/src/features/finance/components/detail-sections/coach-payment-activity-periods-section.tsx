import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Combobox } from "@base-ui-components/react/combobox";
import { Check, ChevronDown } from "lucide-react";
import { UniversalDataTable } from "@/components/universal-data-table/universal-data-table";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Calendar, Plus, Unlink } from "lucide-react";
import { createActivityPeriodColumns } from "../table-columns/activity-period-columns";
import { updateActivityPeriodStatusAction } from "../../actions/updateActivityPeriodStatus";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { coachPaymentQueries } from "../../queries/useCoachPayments";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";

interface CoachPaymentActivityPeriodsSectionProps {
  coachPaymentId: string;
  coachId: string;
  activityPeriods: any[];
  setDeleteModal?: (modal: any) => void;
}

export function CoachPaymentActivityPeriodsSection({
  coachPaymentId,
  coachId,
  activityPeriods,
  setDeleteModal,
}: CoachPaymentActivityPeriodsSectionProps) {
  const queryClient = useQueryClient();
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedPeriodIds, setSelectedPeriodIds] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  // Fetch available unlinked activity periods for this coach
  const { data: availableActivityPeriods = [], isLoading: isLoadingPeriods } = useQuery({
    queryKey: ["unlinkedActivityPeriods", coachId],
    queryFn: async () => {
      if (!coachId) return [];
      const today = new Date().toISOString().split("T")[0];
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from("client_activity_period")
        .select(`
          id,
          start_date,
          end_date,
          active,
          payment_plan:payment_plans!client_activity_period_payment_plan_fkey(
            id,
            client:clients!payment_plans_client_id_fkey(
              id,
              name
            ),
            product:products!payment_plans_product_id_fkey(
              id,
              name,
              default_duration_months
            )
          )
        `)
        .eq("coach_id", coachId)
        .or(`end_date.gte.${today},end_date.is.null`)
        .is("coach_payment", null)
        .order("end_date", { ascending: false });

      if (error) {
        console.error("Error fetching unlinked activity periods:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!coachId && linkModalOpen,
  });

  const handleLinkActivityPeriods = async () => {
    if (selectedPeriodIds.length === 0) {
      toast.error("Please select at least one activity period to link");
      return;
    }

    setIsLinking(true);
    
    try {
      const supabase = createClient();
      
      // Update selected activity periods to link them to this coach payment
      const { error } = await supabase
        .from("client_activity_period")
        .update({ coach_payment: coachPaymentId })
        .in("id", selectedPeriodIds);

      if (error) {
        throw error;
      }

      toast.success(`Successfully linked ${selectedPeriodIds.length} activity period(s)`);
      
      // Refresh the coach payment data
      await queryClient.invalidateQueries({
        queryKey: coachPaymentQueries.detail(coachPaymentId),
      });
      
      // Clear selection and close modal
      setSelectedPeriodIds([]);
      setLinkModalOpen(false);
    } catch (error) {
      console.error("Error linking activity periods:", error);
      toast.error("Failed to link activity periods");
    } finally {
      setIsLinking(false);
    }
  };

  const handleStatusChange = async (id: string, active: boolean) => {
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

  const handleUnlinkPeriod = async (periodId: string) => {
    try {
      const supabase = createClient();
      
      // Remove the coach_payment reference from the activity period
      const { error } = await supabase
        .from("client_activity_period")
        .update({ coach_payment: null })
        .eq("id", periodId);

      if (error) {
        throw error;
      }

      toast.success("Activity period unlinked successfully");
      
      // Refresh the coach payment data
      await queryClient.invalidateQueries({
        queryKey: coachPaymentQueries.detail(coachPaymentId),
      });
    } catch (error) {
      console.error("Error unlinking activity period:", error);
      toast.error("Failed to unlink activity period");
    }
  };

  const activityPeriodColumns = createActivityPeriodColumns({
    onStatusChange: handleStatusChange,
  });
  
  // Define row actions for the table
  const rowActions = [
    {
      label: "Unlink",
      icon: Unlink,
      onClick: (row: any) => handleUnlinkPeriod(row.id),
    },
  ];

  const activityPeriodTable = useReactTable({
    data: activityPeriods || [],
    columns: activityPeriodColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Always show the card with the Link button, whether there are periods or not
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Client Activity Periods
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLinkModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Link Activity Periods
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activityPeriods && activityPeriods.length > 0 ? (
          <UniversalDataTable
            table={activityPeriodTable}
            rowActions={rowActions}
            emptyStateMessage="No activity periods found for this coach payment"
          />
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-sm">No activity periods yet</p>
            <p className="mt-1 text-xs">
              Click "Link Activity Periods" to attach periods to this coach payment
            </p>
          </div>
        )}
      </CardContent>
      
      {/* Link Activity Periods Modal */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link Activity Periods</DialogTitle>
            <DialogDescription>
              Select activity periods to link to this coach payment. Only periods with end dates on or after today are shown.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isLoadingPeriods ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading available activity periods...
              </div>
            ) : availableActivityPeriods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No unlinked activity periods available for this coach.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Activity Periods</label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select multiple periods to link them to this coach payment
                    </p>
                    <Combobox.Root
                      multiple
                      value={selectedPeriodIds}
                      onValueChange={(value) => setSelectedPeriodIds(value as string[])}
                    >
                      <div className="relative">
                        <Combobox.Input
                          placeholder="Search and select activity periods..."
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                        <Combobox.Trigger className="absolute right-2 top-2 h-6 w-6 flex items-center justify-center">
                          <ChevronDown className="h-4 w-4" />
                        </Combobox.Trigger>
                      </div>
                      
                      <Combobox.Portal>
                        <Combobox.Positioner className="outline-none z-[60]" sideOffset={4}>
                          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[300px] overflow-y-auto rounded-md border bg-popover shadow-md p-1 z-[60]">
                            <Combobox.List>
                              {availableActivityPeriods
                                .filter((period: any) => {
                                  const clientName = period.payment_plan?.client?.name || "Unknown Client";
                                  const productName = period.payment_plan?.product?.name || "";
                                  const searchText = `${clientName} ${productName}`.toLowerCase();
                                  return searchText.includes(searchValue.toLowerCase());
                                })
                                .map((period: any) => {
                                  const clientName = period.payment_plan?.client?.name || "Unknown Client";
                                  const productName = period.payment_plan?.product?.name;
                                  const duration = period.payment_plan?.product?.default_duration_months;
                                  const planName = productName && duration 
                                    ? `${productName} - ${duration} Months`
                                    : productName || "No Plan";
                                  const startDate = period.start_date 
                                    ? format(new Date(period.start_date), "MMM dd, yyyy")
                                    : "";
                                  const endDate = period.end_date 
                                    ? format(new Date(period.end_date), "MMM dd, yyyy")
                                    : "Ongoing";
                                  
                                  return (
                                    <Combobox.Item
                                      key={period.id}
                                      value={period.id}
                                      className="relative flex cursor-pointer select-none items-start rounded-sm py-2 px-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                                    >
                                      <Combobox.ItemIndicator className="absolute left-2 top-2.5">
                                        <Check className="h-4 w-4" />
                                      </Combobox.ItemIndicator>
                                      <div className="flex-1">
                                        <div className="font-medium">{clientName}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {planName} • {startDate} - {endDate}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                          Status: {period.active ? "Active" : "Inactive"}
                                        </div>
                                      </div>
                                    </Combobox.Item>
                                  );
                                })}
                            </Combobox.List>
                            {availableActivityPeriods.filter((period: any) => {
                              const clientName = period.payment_plan?.client?.name || "Unknown Client";
                              const productName = period.payment_plan?.product?.name || "";
                              const searchText = `${clientName} ${productName}`.toLowerCase();
                              return searchText.includes(searchValue.toLowerCase());
                            }).length === 0 && (
                              <div className="py-4 px-2 text-center text-sm text-muted-foreground">
                                No matching activity periods found
                              </div>
                            )}
                          </Combobox.Popup>
                        </Combobox.Positioner>
                      </Combobox.Portal>
                    </Combobox.Root>
                  </div>
                  
                  {selectedPeriodIds.length > 0 && (
                    <div className="rounded-lg border p-3 bg-muted/50">
                      <p className="text-sm font-medium mb-2">
                        Selected Periods ({selectedPeriodIds.length})
                      </p>
                      <div className="space-y-1">
                        {selectedPeriodIds.map(id => {
                          const period = availableActivityPeriods.find((p: any) => p.id === id);
                          if (!period) return null;
                          const clientName = period.payment_plan?.client?.name || "Unknown Client";
                          return (
                            <div key={id} className="text-xs text-muted-foreground">
                              • {clientName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {availableActivityPeriods.length > 0 && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setLinkModalOpen(false);
                    setSelectedPeriodIds([]);
                  }}
                  disabled={isLinking}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLinkActivityPeriods}
                  disabled={isLinking || selectedPeriodIds.length === 0}
                >
                  {isLinking ? "Linking..." : `Link ${selectedPeriodIds.length} Period(s)`}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
