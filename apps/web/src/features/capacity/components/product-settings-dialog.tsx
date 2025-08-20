"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { recalculateAllClients } from "../actions/recalculate-all-clients";
import { updateProductUnits } from "../actions/update-product-units";
import { useProducts } from "../queries/capacity";

interface ProductSettingsDialogProps {
  trigger: React.ReactNode;
}

export function ProductSettingsDialog({ trigger }: ProductSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [productUnits, setProductUnits] = useState<Record<string, string>>({});
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useProducts();

  // Initialize product units when data loads
  useEffect(() => {
    if (products) {
      const initialUnits: Record<string, string> = {};
      products.forEach((product) => {
        initialUnits[product.id] = product.client_unit.toString();
      });
      setProductUnits(initialUnits);
    }
  }, [products]);

  const { execute: executeUpdate, isExecuting: isUpdating } = useAction(
    updateProductUnits,
    {
      onSuccess: async (result) => {
        console.log("Products updated successfully:", result);

        // Start recalculation process
        setIsRecalculating(true);

        try {
          // Get the product IDs that were updated
          const updatedProductIds =
            result.data?.updated_products?.map((p) => p.id) || [];

          // Trigger recalculation for clients using these products
          await executeRecalculation({ product_ids: updatedProductIds });
        } catch (error) {
          console.error("Error during recalculation:", error);
          setIsRecalculating(false);
        }
      },
      onError: ({ error }) => {
        console.error("Failed to update products:", error);
        setErrorMessage("Failed to update product units. Please try again.");
        setShowError(true);
      },
    }
  );

  const { execute: executeRecalculation } = useAction(recalculateAllClients, {
    onSuccess: () => {
      setIsRecalculating(false);
      setShowSuccess(true);

      // Invalidate all capacity-related queries
      queryClient.invalidateQueries({ queryKey: ["capacity"] });
      
      // Also invalidate coach queries since they show capacity data
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coaches", "faceted"] });

      // Auto-close after showing success
      setTimeout(() => {
        setOpen(false);
        setShowSuccess(false);
      }, 3000);
    },
    onError: ({ error }) => {
      console.error("Failed to recalculate clients:", error);
      setIsRecalculating(false);
      setErrorMessage(
        "Product units were updated, but recalculation failed. You may need to manually trigger a recalculation."
      );
      setShowError(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!products) return;

    // Prepare the updates - only include products that have changed
    const updates = products
      .filter((product) => {
        const newValue = Number.parseFloat(productUnits[product.id] || "0");
        return newValue !== product.client_unit && newValue > 0;
      })
      .map((product) => ({
        id: product.id,
        client_unit: Number.parseFloat(productUnits[product.id]),
      }));

    if (updates.length === 0) {
      setErrorMessage("No changes detected.");
      setShowError(true);
      return;
    }

    // Clear any previous messages
    setShowError(false);
    setShowSuccess(false);
    
    // Execute update directly (no confirmation needed)
    executeUpdate({ products: updates });
  };

  const handleUnitChange = (productId: string, value: string) => {
    setProductUnits((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const hasChanges = () => {
    if (!products) return false;
    return products.some((product) => {
      const newValue = Number.parseFloat(productUnits[product.id] || "0");
      return newValue !== product.client_unit && newValue > 0;
    });
  };

  const isProcessing = isUpdating || isRecalculating;

  return (
    <Dialog open={open} onOpenChange={!isProcessing ? setOpen : undefined}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Product Unit Settings</DialogTitle>
          <DialogDescription>
            Adjust the base client unit values for each product. Changes will
            trigger a recalculation of all affected clients.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading products...</span>
          </div>
        ) : (
          <>
            {showSuccess && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 text-sm">
                      Products updated and recalculation completed! Please refresh the page in a few minutes to see updated capacity metrics.
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuccess(false)}
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {showError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800 text-sm">
                      {errorMessage}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowError(false)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-8 items-center gap-4"
                >
                  <div className="col-span-6">
                    <Label className="font-medium text-sm">
                      {product.name}
                    </Label>
                    {product.description && (
                      <p className="mt-1 text-muted-foreground text-xs">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={productUnits[product.id] || ""}
                      onChange={(e) =>
                        handleUnitChange(product.id, e.target.value)
                      }
                      placeholder="0.0"
                      className="w-full"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              ))}
            </div>

            {isRecalculating && (
              <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
                  <span className="font-medium text-blue-800 text-sm">
                    Recalculating client units... This may take a few minutes.
                  </span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing || !hasChanges()}>
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isRecalculating ? "Recalculating..." : "Save & Recalculate"}
              </Button>
            </DialogFooter>
          </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
