"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Import update action
import { updateProductAction } from "../actions/updateProduct";

// Import relation delete actions
import { deleteProductPaymentPlanTemplate } from "../actions/relations/payment-plan-templates";

// Import queries
import { productQueries, useProduct } from "../queries/useProducts";

// Import section components
import { ProductBasicInfo } from "./detail-sections/product-basic-info";
import { ProductPaymentPlanTemplatesSection } from "./detail-sections/product-payment-plan-templates-section";
import { ProductSystemInfo } from "./detail-sections/product-system-info";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";

interface ProductDetailViewProps {
  productId: string;
}

export default function ProductDetailView({
  productId,
}: ProductDetailViewProps) {
  const { data: product, isLoading, error } = useProduct(productId);
  const queryClient = useQueryClient();

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: string;
    id: string;
    title: string;
  }>({ isOpen: false, type: "", id: "", title: "" });

  // Edit state for basic info sections
  const [editState, setEditState] = useState<{
    isEditing: boolean;
    section: "basic" | null;
  }>({ isEditing: false, section: null });

  const handleEditToggle = (section: "basic") => {
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
      // Transform form data to match the updateProductSchema format
      const updateData: any = {
        id: productId,
      };

      // Only include fields from the section being edited
      if (editState.section === "basic") {
        // Basic info fields
        updateData.name = data.name;
        updateData.description = data.description || null;
        updateData.default_duration_months =
          data.default_duration_months || null;
        updateData.is_active = data.is_active;
      }

      // Call the update action
      const result = await updateProductAction(updateData);

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
          toast.error("Failed to update product");
        }
        return;
      }

      if (result?.data?.success) {
        toast.success("Product updated successfully");
        setEditState({ isEditing: false, section: null });

        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: productQueries.detail(productId),
        });
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleCancel = () => {
    setEditState({ isEditing: false, section: null });
  };

  const handleDelete = async () => {
    try {
      switch (deleteModal.type) {
        case "payment_plan_template":
          await deleteProductPaymentPlanTemplate(deleteModal.id);
          toast.success("Payment plan template deleted successfully");
          break;
        default:
          throw new Error("Unknown delete type");
      }

      // Invalidate the product query to refresh the data
      await queryClient.invalidateQueries({
        queryKey: productQueries.detail(productId),
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
      throw error;
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !product) return <div>Error loading product</div>;

  const productName = product.name;
  const initials = product.name
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
          <h1 className="font-bold text-2xl">{productName}</h1>
        </div>
      </div>

      {/* Basic Information Grid */}
      <div className="grid gap-6 md:grid-cols-1">
        <ProductBasicInfo
          product={{
            name: product.name,
            description: product.description,
            default_duration_months: product.default_duration_months,
            is_active: product.is_active,
          }}
          isEditing={editState.isEditing && editState.section === "basic"}
          onEditToggle={() => handleEditToggle("basic")}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>

      <ProductPaymentPlanTemplatesSection
        productId={productId}
        paymentPlanTemplates={product.payment_plan_templates || []}
        setDeleteModal={setDeleteModal}
      />

      {/* System Information */}
      <ProductSystemInfo product={product} />

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
