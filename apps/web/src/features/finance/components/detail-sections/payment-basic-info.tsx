import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

import { DollarSign, Edit3, Save, X } from "lucide-react";

interface PaymentBasicInfoProps {
  payment: {
    amount: number | null;
    net_amount: number | null;
    payment_date: string | null;
    payment_method: string | null;
    stripe_transaction_id: string | null;
    status: string | null;
    platform: string | null;
  };
  isEditing?: boolean;
  onEditToggle?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export function PaymentBasicInfo({
  payment,
  isEditing = false,
  onEditToggle,
  onSave,
  onCancel,
}: PaymentBasicInfoProps) {
  const [formData, setFormData] = useState({
    amount: payment.amount || "",
    payment_date: payment.payment_date
      ? payment.payment_date.split("T")[0]
      : "",
    payment_method: payment.payment_method || "",
    stripe_transaction_id: payment.stripe_transaction_id || null,
    status: payment.status || "",
    platform: payment.platform || "",
  });

  const handleSave = () => {
    onSave?.({
      ...formData,
      amount: formData.amount ? Number(formData.amount) : null,
    });
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      amount: payment.amount || "",
      payment_date: payment.payment_date
        ? payment.payment_date.split("T")[0]
        : "",
      payment_method: payment.payment_method || "",
      stripe_transaction_id: payment.stripe_transaction_id || "",
      status: payment.status || "",
      platform: payment.platform || "",
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
            Gross Amount
          </label>
          {isEditing ? (
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              onFocus={(e) => {
                if (e.target.value === "0") {
                  setFormData((prev) => ({ ...prev, amount: "" }));
                }
              }}
              className="mt-1 h-10"
              step="0.01"
            />
          ) : (
            <p className="font-semibold text-sm">
              {formatAmount(payment.amount)}
            </p>
          )}
        </div>
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Net Amount
          </label>
          <p className="text-sm">{formatAmount(payment.net_amount)}</p>
        </div>
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Payment Date
          </label>
          {isEditing ? (
            <DatePicker
              value={formData.payment_date}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  payment_date: value,
                }))
              }
              placeholder="Select payment date"
              className="mt-1 h-10"
            />
          ) : (
            <p className="text-sm">
              {payment.payment_date
                ? new Date(payment.payment_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not set"}
            </p>
          )}
        </div>
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Payment Method
          </label>
          {isEditing ? (
            <Select
              value={formData.payment_method}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, payment_method: value }))
              }
            >
              <SelectTrigger className="mt-1 h-10">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="revolut">Revolut</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm capitalize">
              {payment.payment_method?.split("_").join(" ") || "Not specified"}
            </p>
          )}
        </div>
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Transaction ID
          </label>
          {isEditing ? (
            <Input
              value={formData.stripe_transaction_id ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  stripe_transaction_id: e.target.value,
                }))
              }
              placeholder="Enter transaction ID"
              className="mt-1 h-10"
            />
          ) : (
            <p className="font-mono text-sm">
              {payment.stripe_transaction_id || "Not provided"}
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="not_paid">Not Paid</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm">
              {payment.status ? (
                <StatusBadge
                  colorScheme={payment.status == "paid" ? "green" : "red"}
                >
                  {payment.status}
                </StatusBadge>
              ) : (
                "Not set"
              )}
            </div>
          )}
        </div>
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Platform
          </label>
          {isEditing ? (
            <Select
              value={formData.platform}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, platform: value }))
              }
            >
              <SelectTrigger className="mt-1 h-10">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm capitalize">
              {payment.platform || "Not specified"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
