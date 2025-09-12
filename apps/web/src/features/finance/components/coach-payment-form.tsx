"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox as RadixCombobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@base-ui-components/react/combobox";
import { Check, ChevronDown } from "lucide-react";

import { createCoachPaymentAction } from "../actions/createCoachPayment";
import { updateCoachPaymentAction } from "../actions/updateCoachPayment";
import {
  COACH_PAYMENT_STATUS_OPTIONS,
  getAllValidationErrors,
  type CoachPaymentFormInput,
  type CoachPaymentEditFormInput,
} from "../types/coach-payment";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "@tanstack/react-form";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { format } from "date-fns";
import { activityPeriodQueries } from "@/features/client_activity_period/queries/useActivityPeriods";

interface CoachPaymentFormProps {
  mode: "create" | "edit";
  initialData?: CoachPaymentEditFormInput;
  onSuccess?: (data: any) => void;
}

export default function CoachPaymentForm({
  mode = "create",
  initialData,
  onSuccess,
}: CoachPaymentFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";
  const [selectedCoachId, setSelectedCoachId] = useState<string>(
    initialData?.coach_id || ""
  );
  const [searchValue, setSearchValue] = useState("");

  // Fetch coaches
  const { data: coaches = [] } = useQuery({
    queryKey: ["coaches", "active"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, contract_type")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch available activity periods for selected coach
  const { data: availableActivityPeriods = [] } = useQuery({
    queryKey: ["availableActivityPeriods", selectedCoachId],
    queryFn: async () => {
      if (!selectedCoachId) return [];
      const today = new Date().toISOString().split("T")[0]; // "2025-09-12"

      const supabase = createClient();
      const { data, error } = await supabase
        .from("client_activity_period")
        .select(
          `
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
        `
        )
        .eq("coach_id", selectedCoachId)
        .or(`end_date.gte.${today},end_date.is.null`) // handles NULL end_date
        .is("coach_payment", null)
        .order("end_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCoachId,
  });
  console.log(availableActivityPeriods);
  // Form setup
  const form = useForm({
    defaultValues: {
      coach_id: initialData?.coach_id || "",
      amount: initialData?.amount || 0,
      status: initialData?.status || "Not Paid",
      date: initialData?.date
        ? format(new Date(initialData.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      activity_period_ids: initialData?.activity_period_ids || [],
    } as CoachPaymentFormInput,
    onSubmit: async ({ value }) => {
      console.log("Form onSubmit triggered - value:", value);

      const submitData = {
        ...value,
        amount: Number(value.amount),
      };

      if (isEdit && initialData?.id) {
        updatePayment({
          id: initialData.id,
          ...submitData,
        });
      } else {
        createPayment(submitData);
      }
    },
  });

  // Actions
  const { execute: createPayment, isExecuting: isCreating } = useAction(
    createCoachPaymentAction,
    {
      onSuccess: (result) => {
        if (result?.data?.success) {
          toast.success("Coach payment created successfully!");
          queryClient.invalidateQueries({ queryKey: ["coachPayments"] });

          if (onSuccess) {
            onSuccess(result.data);
          } else {
            router.push("/dashboard/finance/coach-payments");
          }
        }
      },
      onError: (error) => {
        const errors = getAllValidationErrors(error);
        if (errors.length > 0) {
          errors.forEach((err) => toast.error(err));
        } else {
          toast.error("Failed to create coach payment");
        }
      },
    }
  );

  const { execute: updatePayment, isExecuting: isUpdating } = useAction(
    updateCoachPaymentAction,
    {
      onSuccess: (result) => {
        if (result?.data?.success) {
          toast.success("Coach payment updated successfully!");
          queryClient.invalidateQueries({ queryKey: ["coachPayments"] });

          if (onSuccess) {
            onSuccess(result.data);
          } else if (initialData?.id) {
            router.push(`/dashboard/finance/coach-payments/${initialData.id}`);
          }
        }
      },
      onError: (error) => {
        const errors = getAllValidationErrors(error);
        if (errors.length > 0) {
          errors.forEach((err) => toast.error(err));
        } else {
          toast.error("Failed to update coach payment");
        }
      },
    }
  );

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await form.handleSubmit();
  };

  // Update selected coach when form value changes
  useEffect(() => {
    const subscription = form.store.subscribe(() => {
      const coachId = form.store.state.values.coach_id;
      if (coachId !== selectedCoachId) {
        setSelectedCoachId(coachId);
      }
    });
    return () => subscription();
  }, [form.store, selectedCoachId]);

  const coachOptions = coaches.map((coach: any) => ({
    value: coach.id,
    label: `${coach.name} ${
      coach.contract_type ? `(${coach.contract_type})` : ""
    }`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <p className="text-sm text-muted-foreground">Select the coach and payment status</p>
        </div>
        
        <form.Field
            name="coach_id"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Coach is required";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="coach_id">Coach *</Label>
                <RadixCombobox
                  placeholder="Select a coach"
                  options={coachOptions}
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    setSelectedCoachId(value);
                  }}
                  className="w-full h-10"
                  disabled={isEdit}
                />
                {field.state.meta.errors && (
                  <p className="text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="amount"
            validators={{
              onChange: ({ value }) => {
                if (value === null || value === undefined || value <= 0)
                  return "Amount must be greater than 0";
                if (value > 999999.99)
                  return "Amount cannot exceed $999,999.99";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={field.state.value || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      field.handleChange(0);
                    } else {
                      field.handleChange(parseFloat(val));
                    }
                  }}
                  onBlur={field.handleBlur}
                  className="h-10"
                />
                {field.state.meta.errors && (
                  <p className="text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="date"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Payment date is required";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="date">Payment Date *</Label>
                <DatePicker
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value || "")}
                  placeholder="Select payment date"
                />
                {field.state.meta.errors && (
                  <p className="text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="status"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Status is required";
                if (!["Paid", "Not Paid"].includes(value))
                  return "Invalid status";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as "Paid" | "Not Paid")
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {COACH_PAYMENT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors && (
                  <p className="text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Activity Periods Combobox - Always visible, no card */}
          <form.Field name="activity_period_ids">
            {(field) => (
              <div className="space-y-2">
                <Label>Activity Periods (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Link activity periods to this payment
                </p>
                <Combobox.Root
                  multiple
                  value={field.state.value || []}
                  onValueChange={(value) => field.handleChange(value as string[])}
                  disabled={!selectedCoachId}
                >
                  <div className="relative">
                    <Combobox.Input
                      placeholder={!selectedCoachId 
                        ? "Select a coach first..." 
                        : availableActivityPeriods.length === 0
                        ? "No activity periods available"
                        : "Search and select activity periods..."}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      disabled={!selectedCoachId || availableActivityPeriods.length === 0}
                      className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <Combobox.Trigger 
                      className="absolute right-2 top-2 h-6 w-6 flex items-center justify-center"
                      disabled={!selectedCoachId || availableActivityPeriods.length === 0}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Combobox.Trigger>
                  </div>
                  
                  {selectedCoachId && availableActivityPeriods.length > 0 && (
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
                  )}
                </Combobox.Root>
                
                {/* Show selected periods summary */}
                {field.state.value && field.state.value.length > 0 && (
                  <div className="rounded-lg border p-3 bg-muted/50 mt-2">
                    <p className="text-sm font-medium mb-2">
                      Selected Periods ({field.state.value.length})
                    </p>
                    <div className="space-y-1">
                      {field.state.value.map((id: string) => {
                        const period = availableActivityPeriods.find((p: any) => p.id === id);
                        if (!period) return null;
                        const clientName = period.payment_plan?.client?.name || "Unknown Client";
                        const productName = period.payment_plan?.product?.name;
                        const duration = period.payment_plan?.product?.default_duration_months;
                        const planName = productName && duration 
                          ? `${productName} - ${duration} Months`
                          : productName || "No Plan";
                        return (
                          <div key={id} className="text-xs text-muted-foreground">
                            • {clientName} - {planName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form.Field>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Payment"
            : "Create Payment"}
        </Button>
      </div>
    </form>
  );
}
