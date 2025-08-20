"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { editSpecialization } from "@/features/coaches/actions/editSpecialization";
import type { UserSpecialization } from "@/features/coaches/queries/specializations";
import { useAllSpecializations } from "@/features/coaches/queries/specializations";
import { IconDisplay } from "@/features/icons";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Schema matching the server action
const specializationSchema = z.object({
  specializationId: z.string().min(1, "Please select a specialization"),
  isPrimary: z.boolean(),
});

interface EditSpecializationDialogProps {
  userSpecialization: UserSpecialization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditSpecializationDialog({
  userSpecialization,
  open,
  onOpenChange,
}: EditSpecializationDialogProps) {
  const queryClient = useQueryClient();

  // Fetch available specializations
  const { data: specializations, isLoading: specializationsLoading } =
    useAllSpecializations();

  const form = useForm({
    defaultValues: {
      specializationId: userSpecialization.specialization_id,
      isPrimary: userSpecialization.is_primary || false,
    },
    onSubmit: async ({ value }) => {
      const result = await editSpecialization({
        userSpecializationId: userSpecialization.id,
        specializationId: value.specializationId,
        isPrimary: value.isPrimary,
      });

      if (result?.data?.success) {
        toast.success("Specialization updated successfully!");
        onOpenChange(false);
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ["specializations", "user", userSpecialization.user_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["coaches", "detail", userSpecialization.user_id],
        });
      } else if (result?.validationErrors?._errors) {
        const errorMessage =
          result.validationErrors._errors[0] ||
          "Failed to update specialization";
        toast.error(errorMessage);
      }
    },
    validators: {
      onSubmit: specializationSchema,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Specialization</DialogTitle>
          <DialogDescription>
            Update the specialization details for this coach.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="specializationId">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Specialization</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                  disabled={specializationsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations?.map((spec) => (
                      <SelectItem key={spec.id} value={spec.id}>
                        <div className="flex items-center gap-3">
                          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-muted">
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <IconDisplay
                                iconKey={spec.icon || undefined}
                                className="h-4 w-4"
                                fallback={
                                  <span className="font-semibold text-xs">
                                    {spec.name.charAt(0).toUpperCase()}
                                  </span>
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{spec.name}</div>
                            {spec.description && (
                              <div className="text-muted-foreground text-sm">
                                {spec.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 text-sm">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="isPrimary">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                />
                <Label
                  htmlFor={field.name}
                  className="font-normal text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as primary specialization
                </Label>
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.state.isSubmitting}
            >
              Cancel
            </Button>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
