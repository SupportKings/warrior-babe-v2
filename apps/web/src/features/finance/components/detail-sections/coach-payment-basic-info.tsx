import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Edit3, Save, X, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getPaymentStatusColor,
  formatPaymentStatus,
} from "@/features/coaches/utils/payment-status-colors";

interface CoachPaymentBasicInfoProps {
  coachPayment: {
    coach_id: string | null;
    coach_name: string | null;
    status: string | null;
  };
  isEditing?: boolean;
  onEditToggle?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export function CoachPaymentBasicInfo({
  coachPayment,
  isEditing = false,
  onEditToggle,
  onSave,
  onCancel,
}: CoachPaymentBasicInfoProps) {
  const [formData, setFormData] = useState({
    coach_id: coachPayment.coach_id || "",
    status: coachPayment.status || "Not Paid",
  });

  // Fetch coaches for the combobox
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
    enabled: isEditing,
  });

  useEffect(() => {
    setFormData({
      coach_id: coachPayment.coach_id || "",
      status: coachPayment.status || "Not Paid",
    });
  }, [coachPayment, isEditing]);

  const handleSave = () => {
    onSave?.(formData);
  };

  const handleCancel = () => {
    setFormData({
      coach_id: coachPayment.coach_id || "",
      status: coachPayment.status || "Not Paid",
    });
    onCancel?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Basic Information
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
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Coach
          </label>
          {isEditing ? (
            <Combobox
              placeholder="Select a coach"
              options={coaches.map((coach: any) => ({
                value: coach.id,
                label: coach.name,
              }))}
              value={formData.coach_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, coach_id: value }))
              }
              className="mt-1 w-full h-10"
            />
          ) : (
            <p className="text-sm mt-1">
              {coachPayment.coach_name || "Not assigned"}
            </p>
          )}
        </div>
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Status
          </label>
          {isEditing ? (
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="mt-1 h-10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Not Paid">Not Paid</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="mt-1">
              <StatusBadge
                colorScheme={getPaymentStatusColor(coachPayment.status)}
              >
                {formatPaymentStatus(coachPayment.status)}
              </StatusBadge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
