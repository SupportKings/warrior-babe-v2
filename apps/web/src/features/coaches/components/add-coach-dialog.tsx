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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { addCoach } from "@/features/coaches/actions/addCoach";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Schema for coach creation
const coachSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  maxClientUnits: z
    .number()
    .min(1, "Must have at least 1 client unit")
    .optional()
    .nullable(),
  maxNewClientsPerWeek: z.number().min(1).optional().nullable(),
  isPremier: z.boolean(),
});

interface AddCoachDialogProps {
  trigger?: React.ReactNode;
}

export default function AddCoachDialog({ trigger }: AddCoachDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      maxClientUnits: undefined as number | undefined,
      maxNewClientsPerWeek: undefined as number | undefined,
      isPremier: false,
    },
    onSubmit: async ({ value }) => {
      const result = await addCoach({
        email: value.email,
        name: value.name,
        maxClientUnits: value.maxClientUnits,
        maxNewClientsPerWeek: value.maxNewClientsPerWeek,
        isPremier: value.isPremier,
      });

      if (result?.data?.success) {
        toast.success("Coach created successfully!");
        setOpen(false);
        form.reset();
        // Invalidate and refetch all coaches-related queries
        await queryClient.invalidateQueries({ queryKey: ["coaches"] });
        // Also invalidate users queries since coaches are users too
        await queryClient.invalidateQueries({ queryKey: ["users"] });
      } else if (result?.validationErrors?._errors) {
        // Handle server validation errors
        const errorMessage =
          result.validationErrors._errors[0] || "Failed to create coach";
        toast.error(errorMessage);
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = coachSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues.reduce((acc, issue) => {
            const path = issue.path.join(".");
            if (!acc[path]) acc[path] = [];
            acc[path].push(issue.message);
            return acc;
          }, {} as Record<string, string[]>);
        }
        return undefined;
      },
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger>
          <Button>
            <UserRoundPlus className="mr-2 h-4 w-4" />
            Add Coach
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Coach</DialogTitle>
          <DialogDescription>
            Create a new coach account. They'll receive an invitation email to
            set up their account.
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
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Enter coach's full name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  minLength={2}
                />
                {field.state.meta.errors.map((error, index) => (
                  <p
                    key={`name-error-${field.name}-${index}`}
                    className="text-red-500 text-sm"
                  >
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="Enter coach's email address"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                />
                {field.state.meta.errors.map((error, index) => (
                  <p
                    key={`email-error-${field.name}-${index}`}
                    className="text-red-500 text-sm"
                  >
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
          <form.Field name="isPremier">
            {(field) => (
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor={field.name}>Premier Coach</Label>
                  <p className="text-muted-foreground text-sm">
                    Premier coaches can manage teams and have special privileges
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
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="maxClientUnits">
              {(field) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="inline-flex items-center"
                  >
                    <span>Max Client Units</span>
                    <span className="ml-1 text-muted-foreground text-xs">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    placeholder="20"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(
                        value === "" ? undefined : Number(value)
                      );
                    }}
                    min={1}
                  />
                  {field.state.meta.errors.map((error, index) => (
                    <p
                      key={`maxClientUnits-error-${field.name}-${index}`}
                      className="text-red-500 text-sm"
                    >
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>

            <form.Field name="maxNewClientsPerWeek">
              {(field) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="inline-flex items-center"
                  >
                    <span>Max New Clients/w</span>
                    <span className="ml-1 text-muted-foreground text-xs">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    placeholder="2"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(
                        value === "" ? undefined : Number(value)
                      );
                    }}
                    min={1}
                  />
                  {field.state.meta.errors.map((error, index) => (
                    <p
                      key={`maxNewClientsPerWeek-error-${field.name}-${index}`}
                      className="text-red-500 text-sm"
                    >
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <p className="text-muted-foreground text-sm">
            Note: If not specified, max client units and max new clients per
            week will use system defaults.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
                  Create Coach
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
