"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateCoachPaymentAction } from "../actions/updateCoachPayment";
import { deleteClientActivityPeriod } from "../actions/relations/clientActivityPeriods";

import {
  coachPaymentQueries,
  useCoachPayment,
} from "../queries/useCoachPayments";

import { CoachPaymentBasicInfo } from "./detail-sections/coach-payment-basic-info";
import { CoachPaymentActivityPeriodsSection } from "./detail-sections/coach-payment-activity-periods-section";
import { CoachPaymentSystemInfo } from "./detail-sections/coach-payment-system-info";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";

interface CoachPaymentDetailViewProps {
  coachPaymentId: string;
}

export default function CoachPaymentDetailView({
  coachPaymentId,
}: CoachPaymentDetailViewProps) {
  const {
    data: coachPayment,
    isLoading,
    error,
  } = useCoachPayment(coachPaymentId);
  const queryClient = useQueryClient();

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: string;
    id: string;
    title: string;
  }>({ isOpen: false, type: "", id: "", title: "" });

  const [editState, setEditState] = useState<{
    isEditing: boolean;
    section: "basic" | null;
  }>({ isEditing: false, section: null });

  const handleEditToggle = (section: "basic") => {
    if (editState.isEditing && editState.section === section) {
      setEditState({ isEditing: false, section: null });
    } else {
      setEditState({ isEditing: true, section });
    }
  };

  const handleSave = async (data: any) => {
    try {
      const updateData: any = {
        id: coachPaymentId,
      };

      if (editState.section === "basic") {
        updateData.coach_id = data.coach_id;
        updateData.status = data.status;
      }

      const result = await updateCoachPaymentAction(updateData);

      if (result?.validationErrors) {
        const errorMessages: string[] = [];

        if (result.validationErrors._errors) {
          errorMessages.push(...result.validationErrors._errors);
        }

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
          toast.error("Failed to update coach payment");
        }
        return;
      }

      if (result?.data?.success) {
        toast.success("Coach payment updated successfully");
        setEditState({ isEditing: false, section: null });

        await queryClient.invalidateQueries({
          queryKey: coachPaymentQueries.detail(coachPaymentId),
        });
      } else {
        toast.error("Failed to update coach payment");
      }
    } catch (error) {
      console.error("Error updating coach payment:", error);
      toast.error("Failed to update coach payment");
    }
  };

  const handleCancel = () => {
    setEditState({ isEditing: false, section: null });
  };

  const handleDelete = async () => {
    try {
      switch (deleteModal.type) {
        case "activity_period":
          await deleteClientActivityPeriod(deleteModal.id);
          toast.success("Activity period deleted successfully");
          break;
        default:
          throw new Error("Unknown delete type");
      }

      await queryClient.invalidateQueries({
        queryKey: coachPaymentQueries.detail(coachPaymentId),
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
      throw error;
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !coachPayment) return <div>Error loading coach payment</div>;

  const coachName = coachPayment.coach_name || "Unknown Coach";
  const initials = coachName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-2xl">{coachName}</h1>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <CoachPaymentBasicInfo
        coachPayment={{
          coach_id: coachPayment.coach_id,
          coach_name: coachPayment.coach_name,
          status: coachPayment.status,
        }}
        isEditing={editState.isEditing && editState.section === "basic"}
        onEditToggle={() => handleEditToggle("basic")}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <CoachPaymentActivityPeriodsSection
        coachPaymentId={coachPaymentId}
        coachId={coachPayment.coach_id || ""}
        activityPeriods={coachPayment.activity_periods || []}
        setDeleteModal={setDeleteModal}
      />

      {/* System Information */}
      <CoachPaymentSystemInfo coachPayment={coachPayment} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onOpenChange={(open) =>
          setDeleteModal({ ...deleteModal, isOpen: open })
        }
        onConfirm={handleDelete}
        title={deleteModal.title}
        description="This action cannot be undone. This will permanently delete the record."
      />
    </div>
  );
}
