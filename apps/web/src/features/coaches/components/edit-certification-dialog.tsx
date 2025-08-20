"use client";

import { useState } from "react";

import Image from "next/image";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { editCertification } from "@/features/coaches/actions/editCertification";
import { useAllCertifications } from "@/features/coaches/queries/certifications";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Schema matching the server action
const certificationSchema = z.object({
  certificationId: z.string().min(1, "Please select a certification"),
  dateAchieved: z.date({
    message: "Date achieved is required",
  }),
  expiryDate: z.date().optional().nullable(),
  certificateUrl: z
    .string()
    .url({ message: "Invalid URL" })
    .optional()
    .or(z.literal("")),
  verified: z.boolean(),
});

interface EditCertificationDialogProps {
  userCertification: any; // We'll type this properly based on your data structure
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCertificationDialog({
  userCertification,
  open,
  onOpenChange,
}: EditCertificationDialogProps) {
  const [dateAchievedOpen, setDateAchievedOpen] = useState(false);
  const [expiryDateOpen, setExpiryDateOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch available certifications
  const { data: certifications, isLoading: certificationsLoading } =
    useAllCertifications();

  const form = useForm({
    defaultValues: {
      certificationId: userCertification.certification_id,
      dateAchieved: new Date(userCertification.date_achieved),
      expiryDate: userCertification.expiry_date
        ? new Date(userCertification.expiry_date)
        : (undefined as Date | undefined | null),
      certificateUrl: userCertification.certificate_url || "",
      verified: userCertification.verified || false,
    },
    onSubmit: async ({ value }) => {
      if (!value.dateAchieved) {
        toast.error("Please select the date achieved");
        return;
      }

      const result = await editCertification({
        userCertificationId: userCertification.id,
        certificationId: value.certificationId,
        dateAchieved: format(value.dateAchieved, "yyyy-MM-dd"),
        expiryDate: value.expiryDate
          ? format(value.expiryDate, "yyyy-MM-dd")
          : null,
        certificateUrl: value.certificateUrl || null,
        verified: value.verified,
      });

      if (result?.data?.success) {
        toast.success("Certification updated successfully!");
        onOpenChange(false);
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ["certifications", "user", userCertification.user_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["coaches", "detail", userCertification.user_id],
        });
      } else if (result?.validationErrors?._errors) {
        const errorMessage =
          result.validationErrors._errors[0] ||
          "Failed to update certification";
        toast.error(errorMessage);
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        // Only validate if dateAchieved is present since it's required
        if (!value.dateAchieved) {
          return {
            dateAchieved: ["Date achieved is required"],
          };
        }

        // Transform the data to match schema expectations
        const dataToValidate = {
          ...value,
          certificateUrl: value.certificateUrl || undefined,
        };

        const result = certificationSchema.safeParse(dataToValidate);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Certification</DialogTitle>
          <DialogDescription>
            Update the certification details for this coach.
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
          <form.Field name="certificationId">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Certification</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                  disabled={certificationsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a certification" />
                  </SelectTrigger>
                  <SelectContent>
                    {certifications?.map((cert) => (
                      <SelectItem key={cert.id} value={cert.id}>
                        <div className="flex items-center gap-3">
                          {cert.icon && (
                            <Image
                              width={32}
                              height={32}
                              src={cert.icon}
                              alt={cert.name}
                              className="h-8 w-8 rounded object-contain"
                            />
                          )}
                          <div>
                            <div className="font-medium">{cert.name}</div>
                            <div className="text-muted-foreground text-sm">
                              {cert.issuer}
                            </div>
                          </div>
                        </div>
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

          <form.Field name="dateAchieved">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Date Achieved</Label>
                <Popover open={dateAchievedOpen} onOpenChange={setDateAchievedOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.state.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.state.value ? (
                        format(field.state.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.state.value}
                      onSelect={(date) => {
                        field.handleChange(date || new Date());
                        setDateAchievedOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                {field.state.meta.errors.map((error) => (
                  <p key={error} className="text-red-500 text-sm">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="expiryDate">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Expiry Date (Optional)</Label>
                <Popover open={expiryDateOpen} onOpenChange={setExpiryDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.state.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.state.value ? (
                        format(field.state.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.state.value || undefined}
                      onSelect={(date) => {
                        field.handleChange(date);
                        setExpiryDateOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </form.Field>

          <form.Field name="certificateUrl">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Certificate URL (Optional)</Label>
                <Input
                  id={field.name}
                  type="url"
                  placeholder="https://example.com/certificate.pdf"
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

          <form.Field name="verified">
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
                  Mark as verified
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
                  Update Certification
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
