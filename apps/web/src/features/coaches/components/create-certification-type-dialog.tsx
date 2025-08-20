"use client";

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
import { Textarea } from "@/components/ui/textarea";

import { createCertificationType } from "@/features/coaches/actions/createCertificationType";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const certificationTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Certification name is required")
    .max(100, "Name is too long"),
  issuer: z
    .string()
    .min(1, "Issuer is required")
    .max(100, "Issuer name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  icon: z.union([z.literal(""), z.string().url("Invalid icon URL")]).optional(),
});

interface CreateCertificationTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (certification: {
    id: string;
    name: string;
    issuer: string;
    description?: string | null;
    icon?: string | null;
    is_active?: boolean | null;
  }) => void;
  nested?: boolean;
}

export default function CreateCertificationTypeDialog({
  open,
  onOpenChange,
  onSuccess,
  nested = false,
}: CreateCertificationTypeDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      issuer: "",
      description: "",
      icon: "",
    },
    onSubmit: async ({ value }) => {
      const result = await createCertificationType({
        name: value.name,
        issuer: value.issuer,
        description: value.description || null,
        icon: value.icon || null,
      });

      if (result?.data?.success) {
        toast.success("Certification type created successfully!");

        // Invalidate certification queries to refresh the list
        await queryClient.invalidateQueries({
          queryKey: ["certifications", "all"],
        });

        // Call onSuccess callback with the new certification
        if (onSuccess && result.data.data) {
          onSuccess(result.data.data);
        }

        // Close dialog and reset form
        onOpenChange(false);
        form.reset();
      } else if (result?.validationErrors?._errors) {
        const errorMessage =
          result.validationErrors._errors[0] ||
          "Failed to create certification type";
        toast.error(errorMessage);
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = certificationTypeSchema.safeParse(value);
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent nested={nested} className="w-[500px]">
        <DialogTitle className="">Create New Certification Type</DialogTitle>
        <DialogDescription className="">
          Add a new certification type that coaches can earn.
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
                <Label htmlFor={field.name}>Certification Name *</Label>
                <Input
                  id={field.name}
                  placeholder="e.g., Certified Personal Trainer"
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

          <form.Field name="issuer">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Issuing Organization *</Label>
                <Input
                  id={field.name}
                  placeholder="e.g., National Academy of Sports Medicine"
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

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description (Optional)</Label>
                <Textarea
                  id={field.name}
                  placeholder="Brief description of this certification..."
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

          <form.Field name="icon">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Icon URL (Optional)</Label>
                <Input
                  id={field.name}
                  type="url"
                  placeholder="https://example.com/icon.png"
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

          <div className="flex items-center justify-end gap-3 pt-4">
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <form.Subscribe>
              {(state) => {
                console.log("Form state:", {
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                  values: state.values,
                  errors: state.errors,
                });
                return (
                  <Button
                    type="submit"
                    disabled={!state.canSubmit || state.isSubmitting}
                  >
                    {state.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Certification Type
                  </Button>
                );
              }}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
