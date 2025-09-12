"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// Import update action
import { updatePaymentAction } from "../actions/updatePaymentDetail";
// Import queries
import { paymentQueries, usePayment } from "../queries/usePayments";
// Import section components
import { PaymentBasicInfo } from "./detail-sections/payment-basic-info";
import { PaymentCustomerDetails } from "./detail-sections/payment-customer-details";
import { PaymentDisputeInfo } from "./detail-sections/payment-dispute-info";
import { PaymentSystemInfo } from "./detail-sections/payment-system-info";

interface PaymentDetailViewProps {
  paymentId: string;
}

export default function PaymentDetailView({
  paymentId,
}: PaymentDetailViewProps) {
  const { data: payment, isLoading, error } = usePayment(paymentId);
  const queryClient = useQueryClient();

  // Edit state for basic info sections
  const [editState, setEditState] = useState<{
    isEditing: boolean;
    section: "basic" | "customer" | "dispute" | null;
  }>({ isEditing: false, section: null });

  const handleEditToggle = (section: "basic" | "customer" | "dispute") => {
    if (editState.isEditing && editState.section === section) {
      // Cancel edit
      setEditState({ isEditing: false, section: null });
    } else {
      // Start edit
      setEditState({ isEditing: true, section });
    }
  };

  const handleSave = async (data: any) => {
    try {
      // Transform form data to match the updatePaymentSchema format
      const updateData: any = {
        id: paymentId,
      };

      // Only include fields from the section being edited
      if (editState.section === "basic") {
        // Basic info fields
        if (data.amount !== undefined) updateData.amount = data.amount;
        if (data.payment_date !== undefined)
          updateData.payment_date = data.payment_date;
        if (data.payment_method !== undefined)
          updateData.payment_method = data.payment_method;
        if (data.stripe_transaction_id !== undefined)
          updateData.stripe_transaction_id = data.stripe_transaction_id;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.platform !== undefined) updateData.platform = data.platform;
      } else if (editState.section === "customer") {
        // Customer details fields - these will be handled through payment_slots relation
        // For now we'll just show them as read-only from the joined data
        toast.info("Customer details are managed through payment plans");
        setEditState({ isEditing: false, section: null });
        return;
      } else if (editState.section === "dispute") {
        // Dispute info fields
        if (data.declined_at !== undefined)
          updateData.declined_at = data.declined_at || null;
        if (data.disputed_status !== undefined)
          updateData.disputed_status = data.disputed_status;
        if (data.dispute_fee !== undefined)
          updateData.dispute_fee = data.dispute_fee;
      }

      // Call the update action
      const result = await updatePaymentAction(updateData);

      if (result?.validationErrors) {
        // Handle validation errors
        const errorMessages: string[] = [];

        if (result.validationErrors._errors) {
          errorMessages.push(...result.validationErrors._errors);
        }

        // Handle field-specific errors
        Object.entries(result.validationErrors).forEach(([field, errors]) => {
          if (field !== "_errors" && errors) {
            if (Array.isArray(errors)) {
              errorMessages.push(...errors);
            } else if (
              errors &&
              typeof errors === "object" &&
              "_errors" in errors &&
              Array.isArray(errors._errors)
            ) {
              errorMessages.push(...errors._errors);
            }
          }
        });

        if (errorMessages.length > 0) {
          errorMessages.forEach((error) => toast.error(error));
        } else {
          toast.error("Failed to update payment");
        }
        return;
      }

      if (result?.data?.success) {
        toast.success("Payment updated successfully");
        setEditState({ isEditing: false, section: null });

        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: paymentQueries.detail(paymentId),
        });
      } else {
        toast.error("Failed to update payment");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment");
    }
  };

  const handleCancel = () => {
    setEditState({ isEditing: false, section: null });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !payment) return <div>Error loading payment</div>;

  const customerInfo = {
    email: payment.client_email,
    name: payment.client_name,
  };
  const paymentPlan = {
    name: payment.product_name && payment.duration
      ? `${payment.product_name} - ${payment.duration} Months`
      : payment.product_name || "",
  };


  return (
    <div className="space-y-6 p-6">
      {/* Basic Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <PaymentBasicInfo
          payment={{
            amount: payment.payment_amount
              ? payment.payment_amount / 100
              : payment.payment_amount,
            net_amount: payment.balance_net
              ? payment.balance_net / 100
              : payment.balance_net,
            payment_date: payment.payment_date,
            payment_method: payment.payment_method,
            stripe_transaction_id: payment.stripe_transaction_id,
            status: payment.status,
            platform: payment.platform,
          }}
          isEditing={editState.isEditing && editState.section === "basic"}
          onEditToggle={() => handleEditToggle("basic")}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        <PaymentCustomerDetails
          customer={{
            customer_email_address: customerInfo?.email || null,
            customer_name: customerInfo?.name || null,
            customer_billing_address: null, // Not available in current schema
            payment_plan_name: paymentPlan?.name || null,
            slot_amount_due: payment?.amount_due
              ? payment.amount_due / 100
              : payment?.amount_due,
            slot_amount_paid: payment?.payment_amount
              ? payment.payment_amount / 100
              : payment?.payment_amount,
            client_id: payment?.client_id || null,
          }}
        />
      </div>

      {/* Dispute Information */}
      <PaymentDisputeInfo
        dispute={{
          declined_at: payment.declined_at,
          disputed_status: payment.disputed_status,
          dispute_fee: payment.dispute_fee
            ? payment.dispute_fee / 100
            : payment.dispute_fee,
          stripe_charge_id: payment.stripe_transaction_id, // Using transaction ID as charge ID
        }}
        isEditing={editState.isEditing && editState.section === "dispute"}
        onEditToggle={() => handleEditToggle("dispute")}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* System Information */}
      <PaymentSystemInfo
        payment={{
          created_at: payment.created_at,
          updated_at: payment.updated_at,
        }}
      />
    </div>
  );
}
