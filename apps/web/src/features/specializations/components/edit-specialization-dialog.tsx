"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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

import type { Specialization } from "@/features/coaches/queries/specializations.server";
import { updateSpecialization } from "@/features/specializations/actions/updateSpecialization";
import { IconPicker } from "@/features/icons";
import { useQuery } from "@tanstack/react-query";
import { specializationCategoryQueries } from "@/features/specializations/queries/categories.queries";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const specializationSchema = z.object({
  name: z
    .string()
    .min(1, "Specialization name is required")
    .max(100, "Name is too long"),
  category: z.string().max(50, "Category is too long").optional(),
  category_id: z.string().uuid().optional(),
  description: z.string().max(500, "Description is too long").optional(),
  icon: z.string().max(50, "Icon key is too long").optional(),
  is_active: z.boolean(),
});

interface EditSpecializationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialization: Specialization;
}

export default function EditSpecializationDialog({
  open,
  onOpenChange,
  specialization,
}: EditSpecializationDialogProps) {
  const queryClient = useQueryClient();
  
  // Fetch categories
  const { data: categories = [] } = useQuery(
    specializationCategoryQueries.active()
  );

  const form = useForm({
    defaultValues: {
      name: specialization.name,
      category: specialization.category || "",
      category_id: specialization.category_id || "",
      description: specialization.description || "",
      icon: specialization.icon || "",
      is_active: specialization.is_active ?? true,
    },
    onSubmit: async ({ value }) => {
      const result = await updateSpecialization({
        id: specialization.id,
        name: value.name,
        category: value.category || null,
        category_id: value.category_id || undefined,
        description: value.description || null,
        icon: value.icon || null,
        is_active: value.is_active,
      });

      if (result?.data?.success) {
        toast.success("Specialization updated successfully!");

        // Invalidate specialization queries to refresh the list
        await queryClient.invalidateQueries({
          queryKey: ["specializations", "all"],
        });

        // Close dialog
        onOpenChange(false);
      } else if (result?.validationErrors?._errors) {
        const errorMessage =
          result.validationErrors._errors[0] ||
          "Failed to update specialization";
        toast.error(errorMessage);
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = specializationSchema.safeParse(value);
        if (!result.success) {
          const errors: Record<string, string[]> = {};
          result.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;
            if (!errors[field]) {
              errors[field] = [];
            }
            errors[field].push(issue.message);
          });
          return errors;
        }
        return undefined;
      },
    },
  });

  // Reset form when specialization changes
  useEffect(() => {
    form.reset({
      name: specialization.name,
      category: specialization.category || "",
      category_id: specialization.category_id || "",
      description: specialization.description || "",
      icon: specialization.icon || "",
      is_active: specialization.is_active ?? true,
    });
  }, [specialization, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px]">
        <DialogTitle>Edit Specialization</DialogTitle>
        <DialogDescription>
          Update the specialization details.
        </DialogDescription>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-3"
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Specialization Name *</Label>
                <Input
                  id={field.name}
                  placeholder="e.g., Weight Loss, Strength Training"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-red-500 text-sm">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="category_id">
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name}>Category (Optional)</Label>
                  {field.state.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => field.handleChange("")}
                      className="h-auto p-0 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Select
                  value={field.state.value || undefined}
                  onValueChange={(value) => field.handleChange(value || "")}
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
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-red-500 text-sm">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="icon">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Icon (Optional)</Label>
                <IconPicker
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  placeholder="Select an icon..."
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-red-500 text-sm">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description (Optional)</Label>
                <Textarea
                  id={field.name}
                  placeholder="Brief description of this specialization..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={2}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-red-500 text-sm">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="is_active">
            {(field) => (
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor={field.name}>Active Status</Label>
                  <p className="text-muted-foreground text-sm">
                    Inactive specializations won't be available for selection
                  </p>
                </div>
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                />
              </div>
            )}
          </form.Field>

          <div className="flex items-center justify-end gap-3 pt-4">
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Specialization
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
