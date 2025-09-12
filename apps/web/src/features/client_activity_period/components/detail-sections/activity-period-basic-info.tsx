import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

import { useActiveCoachPayments } from "@/features/coach-payments/queries/useCoachPayments";
// Import data sources
import { useActiveCoaches } from "@/features/coaches/queries/useCoaches";
import { useActivePaymentPlans } from "@/features/payment-plans/queries/usePaymentPlans";

import { format } from "date-fns";
import { Calendar, CalendarIcon, Edit3, Save, X } from "lucide-react";

interface ActivityPeriodBasicInfoProps {
  activityPeriod: {
    start_date: string;
    end_date?: string | null;
    active: boolean;
    coach_id?: string | null;
    coach_payment?: string | null;
    payment_plan?: string | null;
    client_name?: string;
    payment_plan_name?: string;
    coach_name?: string;
    coach_payment_amount?: number;
    payment_plan_detail: { name: string };
    coach_payment_detail: { amount: string };
    product: {
      name: string;
      default_duration_months: number;
    };
    coach: { name: string };
  };
  isEditing?: boolean;
  onEditToggle?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export function ActivityPeriodBasicInfo({
  activityPeriod,
  isEditing = false,
  onEditToggle,
  onSave,
  onCancel,
}: ActivityPeriodBasicInfoProps) {
  const [formData, setFormData] = useState({
    start_date: activityPeriod.start_date,
    end_date: activityPeriod.end_date || "",
    active: activityPeriod.active,
    coach_id:
      activityPeriod.coach_id != null
        ? String(activityPeriod.coach_id)
        : "none",
    coach_payment:
      activityPeriod.coach_payment != null
        ? String(activityPeriod.coach_payment)
        : "none",
    payment_plan:
      activityPeriod.payment_plan != null
        ? String(activityPeriod.payment_plan)
        : "none",
  });

  // Fetch data for dropdowns when editing
  const { data: coaches = [] } = useActiveCoaches();
  const { data: paymentPlans = [] } = useActivePaymentPlans(isEditing);
  const { data: coachPayments = [] } = useActiveCoachPayments(isEditing);

  useEffect(() => {
    // Reset form data when activityPeriod changes
    setFormData({
      start_date: activityPeriod.start_date,
      end_date: activityPeriod.end_date || "",
      active: activityPeriod.active,
      coach_id:
        activityPeriod.coach_id != null
          ? String(activityPeriod.coach_id)
          : "none",
      coach_payment:
        activityPeriod.coach_payment != null
          ? String(activityPeriod.coach_payment)
          : "none",
      payment_plan:
        activityPeriod.payment_plan != null
          ? String(activityPeriod.payment_plan)
          : "none",
    });
  }, [activityPeriod]);

  const handleSave = () => {
    // Convert "none" values back to null for database
    const dataToSave = {
      ...formData,
      coach_id: formData.coach_id === "none" ? null : formData.coach_id,
      coach_payment:
        formData.coach_payment === "none" ? null : formData.coach_payment,
      payment_plan:
        formData.payment_plan === "none" ? null : formData.payment_plan,
    };
    onSave?.(dataToSave);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      start_date: activityPeriod.start_date,
      end_date: activityPeriod.end_date || "",
      active: activityPeriod.active,
      coach_id: activityPeriod.coach_id || "none",
      coach_payment: activityPeriod.coach_payment || "none",
      payment_plan: activityPeriod.payment_plan || "none",
    });
    onCancel?.();
  };

  const formatDate = (dateString: string | null | Date | undefined) => {
    if (!dateString) return "Not set";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activity Period Details
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditToggle}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client Info (Read-only) */}
        {activityPeriod.client_name && (
          <div>
            <span className="font-medium text-muted-foreground text-sm">
              Client
            </span>
            <p className="text-sm">{activityPeriod.client_name}</p>
          </div>
        )}

        {/* Payment Plan */}
        <div>
          <span className="font-medium text-muted-foreground text-sm">
            Payment Plan
          </span>
          {isEditing ? (
            <Select
              value={formData.payment_plan || "none"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, payment_plan: value }))
              }
            >
              <SelectTrigger className="mt-1 h-10">
                <SelectValue placeholder="Select a payment plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {paymentPlans.map((plan: any) => (
                  <SelectItem key={plan.id} value={String(plan.id)}>
                    {plan.name} ({plan.client?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm">
              {Boolean(activityPeriod.product.name)
                ? activityPeriod.product.name + " - " + activityPeriod.product.default_duration_months + " Months"
                : "Not set"}
            </p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <span className="font-medium text-muted-foreground text-sm">
            Start Date
          </span>
          {isEditing ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "mt-1 h-10 w-full justify-start text-left font-normal",
                    !formData.start_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.start_date ? (
                    format(new Date(formData.start_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={
                    formData.start_date
                      ? new Date(formData.start_date)
                      : undefined
                  }
                  onSelect={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_date: date ? format(date, "yyyy-MM-dd") : "",
                    }))
                  }
                />
              </PopoverContent>
            </Popover>
          ) : (
            <p className="text-sm">{formatDate(activityPeriod.start_date)}</p>
          )}
        </div>

        {/* End Date */}
        <div>
          <span className="font-medium text-muted-foreground text-sm">
            End Date
          </span>
          {isEditing ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "mt-1 h-10 w-full justify-start text-left font-normal",
                    !formData.end_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.end_date ? (
                    format(new Date(formData.end_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={
                    formData.end_date ? new Date(formData.end_date) : undefined
                  }
                  onSelect={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_date: date ? format(date, "yyyy-MM-dd") : "",
                    }))
                  }
                />
              </PopoverContent>
            </Popover>
          ) : (
            <p className="text-sm">{formatDate(activityPeriod.end_date)}</p>
          )}
        </div>

        {/* Coach */}
        <div>
          <span className="font-medium text-muted-foreground text-sm">
            Coach
          </span>
          {isEditing ? (
            <Select
              value={formData.coach_id || "none"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, coach_id: value }))
              }
            >
              <SelectTrigger className="mt-1 h-10">
                <SelectValue placeholder="Select a coach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {coaches.map((coach: any) => (
                  <SelectItem key={coach.id} value={String(coach.id)}>
                    {coach.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm">
              {activityPeriod.coach.name ?? "Not assigned"}
            </p>
          )}
        </div>

        {/* Coach Payment */}
        <div>
          <span className="font-medium text-muted-foreground text-sm">
            Coach Payment
          </span>
          {isEditing ? (
            <Select
              value={formData.coach_payment || "none"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, coach_payment: value }))
              }
            >
              <SelectTrigger className="mt-1 h-10">
                <SelectValue placeholder="Select a coach payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {coachPayments.map((payment: any) => (
                  <SelectItem key={payment.id} value={String(payment.id)}>
                    ${payment.amount} - {payment.coach?.name} (
                    {formatDate(payment.date)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm">
              {activityPeriod.coach_payment_detail
                ? `$${activityPeriod.coach_payment_detail.amount}`
                : "Not set"}
            </p>
          )}
        </div>

        {/* Active Status */}
        <div>
          <span className="font-medium text-muted-foreground text-sm">
            Status
          </span>
          {isEditing ? (
            <div className="mt-1 flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, active: !!checked }))
                }
              />
              <label htmlFor="active" className="text-sm">
                Active
              </label>
            </div>
          ) : (
            <div className="text-sm">
              <StatusBadge>
                {activityPeriod.active ? "Active" : "Inactive"}
              </StatusBadge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
