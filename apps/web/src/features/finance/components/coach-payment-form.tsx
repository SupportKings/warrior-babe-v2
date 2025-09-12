"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";

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
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Select the coach and payment status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <Combobox
                  placeholder="Select a coach"
                  options={coachOptions}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
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
        </CardContent>
      </Card>

      {/* Client Activity Periods */}
      {selectedCoachId && availableActivityPeriods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Client Activity Periods</CardTitle>
            <CardDescription>
              Select activity periods to attach to this payment (end date must
              be before today)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form.Field name="activity_period_ids">
              {(field) => (
                <div className="space-y-3">
                  {availableActivityPeriods.map((period: any) => {
                    const isChecked =
                      field.state.value?.includes(period.id) || false;
                    const clientName =
                      period.payment_plan?.client?.name || "Unknown Client";
                    const productName = period.payment_plan?.product?.name;
                    const duration =
                      period.payment_plan?.product?.default_duration_months;
                    const planName =
                      productName && duration
                        ? `${productName} - ${duration} Months`
                        : productName || "No Plan";
                    const startDate = period.start_date
                      ? format(new Date(period.start_date), "MMM dd, yyyy")
                      : "";
                    const endDate = period.end_date
                      ? format(new Date(period.end_date), "MMM dd, yyyy")
                      : "Ongoing";

                    return (
                      <div
                        key={period.id}
                        className="flex items-start space-x-3 rounded-lg border p-3"
                      >
                        <Checkbox
                          id={period.id}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const currentValue = field.state.value || [];
                            if (checked) {
                              field.handleChange([...currentValue, period.id]);
                            } else {
                              field.handleChange(
                                currentValue.filter(
                                  (id: string) => id !== period.id
                                )
                              );
                            }
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor={period.id} className="cursor-pointer">
                            <div className="font-medium">{clientName}</div>
                            <div className="text-muted-foreground text-sm">
                              {planName} • {startDate} - {endDate}
                            </div>
                          </Label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </form.Field>
          </CardContent>
        </Card>
      )}

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
