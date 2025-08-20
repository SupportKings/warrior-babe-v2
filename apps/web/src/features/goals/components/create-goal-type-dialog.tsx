"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createGoalType } from "../actions/createGoalType";
import { goalTypeQueries } from "../queries/goalTypes.queries";
import { goalCategoryQueries } from "../queries/categories.queries";

interface CreateGoalTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateGoalTypeDialog({
  open,
  onOpenChange,
}: CreateGoalTypeDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    category_id: "",
    description: "",
    is_measurable: false,
    unit_of_measure: "",
    default_duration_days: "",
  });

  // Fetch categories
  const { data: categories = [] } = useQuery(
    goalCategoryQueries.active()
  );

  const { executeAsync, isPending } = useAction(createGoalType);

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      category_id: "",
      description: "",
      is_measurable: false,
      unit_of_measure: "",
      default_duration_days: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await executeAsync({
      name: formData.name,
      category: formData.category || null,
      category_id: formData.category_id || undefined,
      description: formData.description || null,
      icon: null,
      is_measurable: formData.is_measurable,
      unit_of_measure: formData.is_measurable
        ? formData.unit_of_measure || null
        : null,
      default_duration_days: formData.default_duration_days
        ? Number.parseInt(formData.default_duration_days)
        : null,
    });

    if (result?.data?.success) {
      toast.success("Goal type created successfully");
      queryClient.invalidateQueries({
        queryKey: goalTypeQueries.allGoalTypes().queryKey,
      });
      onOpenChange(false);
      resetForm();
    } else if (result?.validationErrors?._errors) {
      const errorMessage =
        result.validationErrors._errors[0] || "Failed to create goal type";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Goal Type</DialogTitle>
            <DialogDescription>
              Add a new goal type for client objectives
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Weight Loss"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Category</Label>
                {formData.category_id && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, category_id: "" })}
                    className="h-auto p-0 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Select
                value={formData.category_id || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value || "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of this goal type"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_measurable">Measurable Goal</Label>
                <p className="text-muted-foreground text-xs">
                  Can progress be measured with numbers?
                </p>
              </div>
              <Switch
                id="is_measurable"
                checked={formData.is_measurable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_measurable: checked })
                }
              />
            </div>

            {formData.is_measurable && (
              <div className="grid gap-2">
                <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                <Input
                  id="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unit_of_measure: e.target.value,
                    })
                  }
                  placeholder="e.g., lbs, miles, minutes"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="default_duration_days">
                Default Duration (days)
              </Label>
              <Input
                id="default_duration_days"
                type="number"
                value={formData.default_duration_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    default_duration_days: e.target.value,
                  })
                }
                placeholder="e.g., 30"
                min="1"
                max="365"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Goal Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
