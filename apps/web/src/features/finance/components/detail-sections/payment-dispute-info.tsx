import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DatePicker } from "@/components/ui/date-picker";

import { useState } from "react";
import { Edit3, Save, X, AlertTriangle } from "lucide-react";

interface PaymentDisputeInfoProps {
  dispute: {
    declined_at: string | null;
    disputed_status: string | null;
    dispute_fee: number | null;
    stripe_charge_id: string | null;
  };
  isEditing?: boolean;
  onEditToggle?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export function PaymentDisputeInfo({
  dispute,
  isEditing = false,
  onEditToggle,
  onSave,
  onCancel,
}: PaymentDisputeInfoProps) {
  const [formData, setFormData] = useState({
    declined_at: dispute.declined_at ? dispute.declined_at.split("T")[0] : "",
    disputed_status: dispute.disputed_status || "Not Disputed",
    dispute_fee: dispute.dispute_fee || "",
    stripe_charge_id: dispute.stripe_charge_id || "",
  });

  const handleSave = () => {
    onSave?.({
      ...formData,
      declined_at: formData.declined_at || null,
      dispute_fee: formData.dispute_fee ? Number(formData.dispute_fee) : null,
    });
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      declined_at: dispute.declined_at ? dispute.declined_at.split("T")[0] : "",
      disputed_status: dispute.disputed_status || "Not Disputed",
      dispute_fee: dispute.dispute_fee || "",
      stripe_charge_id: dispute.stripe_charge_id || "",
    });
    onCancel?.();
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getDisputeStatusVariant = (status: string | null) => {
    switch (status) {
      case "Not Disputed":
        return "gray";
      case "Dispute Won":
        return "green";
      case "Dispute Lost":
        return "red";
      default:
        return "yellow";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Dispute Information
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
            Declined At
          </label>
          {isEditing ? (
            <DatePicker
              value={formData.declined_at}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  declined_at: value,
                }))
              }
              placeholder="Select declined date"
              className="mt-1 h-10"
            />
          ) : (
            <p className="text-sm">
              {dispute.declined_at
                ? new Date(dispute.declined_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not declined"}
            </p>
          )}
        </div>
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Dispute Status
          </label>
          {isEditing ? (
            <Select
              value={formData.disputed_status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, disputed_status: value }))
              }
            >
              <SelectTrigger className="mt-1 h-10">
                <SelectValue placeholder="Select dispute status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Disputed">Not Disputed</SelectItem>
                <SelectItem value="Disputed">Disputed</SelectItem>
                <SelectItem value="Evidence Submitted">
                  Evidence Submitted
                </SelectItem>
                <SelectItem value="Dispute Won">Dispute Won</SelectItem>
                <SelectItem value="Dispute Lost">Dispute Lost</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm">
              <StatusBadge
                colorScheme={getDisputeStatusVariant(dispute.disputed_status)}
              >
                {dispute.disputed_status || "Not Disputed"}
              </StatusBadge>
            </div>
          )}
        </div>
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Dispute Fee
          </label>
          {isEditing ? (
            <Input
              type="number"
              value={formData.dispute_fee}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dispute_fee: e.target.value,
                }))
              }
              onFocus={(e) => {
                if (e.target.value === "0") {
                  setFormData((prev) => ({ ...prev, dispute_fee: "" }));
                }
              }}
              className="mt-1 h-10"
              step="0.01"
            />
          ) : (
            <p className="text-sm font-semibold">
              {formatAmount(dispute.dispute_fee)}
            </p>
          )}
        </div>
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Stripe Charge ID
          </label>
          {isEditing ? (
            <Input
              value={formData.stripe_charge_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  stripe_charge_id: e.target.value,
                }))
              }
              placeholder="Enter Stripe charge ID"
              className="mt-1 h-10"
              disabled
            />
          ) : (
            <p className="text-sm font-mono">
              {dispute.stripe_charge_id || "Not available"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
