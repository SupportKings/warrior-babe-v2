"use client";

import { useState } from "react";

import Image from "next/image";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import { addCertification } from "@/features/coaches/actions/addCertification";
import { useAllCertifications } from "@/features/coaches/queries/certifications";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  PlusCircle,
  SquircleDashed,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import CreateCertificationTypeDialog from "./create-certification-type-dialog";

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

interface AddCertificationDialogProps {
  userId: string;
}

export default function AddCertificationDialog({
  userId,
}: AddCertificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const queryClient = useQueryClient();

  // Fetch available certifications
  const { data: certifications, isLoading: certificationsLoading } =
    useAllCertifications();

  const form = useForm({
    defaultValues: {
      certificationId: "",
      dateAchieved: undefined as Date | undefined,
      expiryDate: undefined as Date | undefined | null,
      certificateUrl: "",
      verified: false,
    },
    onSubmit: async ({ value }) => {
      if (!value.dateAchieved) {
        toast.error("Please select the date achieved");
        return;
      }

      const result = await addCertification({
        userId,
        certificationId: value.certificationId,
        dateAchieved: format(value.dateAchieved, "yyyy-MM-dd"),
        expiryDate: value.expiryDate
          ? format(value.expiryDate, "yyyy-MM-dd")
          : null,
        certificateUrl: value.certificateUrl || null,
        verified: value.verified,
      });

      if (result?.data?.success) {
        toast.success("Certification added successfully!");
        setOpen(false);
        form.reset();
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ["certifications", "user", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["coaches", "detail", userId],
        });
      } else if (result?.validationErrors?._errors) {
        const errorMessage =
          result.validationErrors._errors[0] || "Failed to add certification";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Certification
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Certification</DialogTitle>
          <DialogDescription>
            Add a professional certification to this coach's profile.
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
            {(field) => {
              const selectedCert = certifications?.find(
                (cert) => cert.id === field.state.value
              );

              const filteredCertifications = certifications?.filter(
                (cert) =>
                  cert.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                  cert.issuer?.toLowerCase().includes(searchValue.toLowerCase())
              );

              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Certification</Label>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        aria-expanded={comboboxOpen}
                        className="w-full justify-between"
                        disabled={certificationsLoading}
                      >
                        {selectedCert ? (
                          <div className="flex items-center gap-3">
                            {selectedCert.icon ? (
                              <Image
                                width={24}
                                height={24}
                                src={selectedCert.icon}
                                alt={selectedCert.name}
                                className="h-6 w-6 rounded object-contain"
                              />
                            ) : (
                              <SquircleDashed className="h-6 w-6 text-muted-foreground" />
                            )}
                            <div className="text-left">
                              <div className="font-medium">
                                {selectedCert.name}
                                {selectedCert.issuer && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    — {selectedCert.issuer}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span>Select a certification</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search certifications..."
                          value={searchValue}
                          onValueChange={setSearchValue}
                        />
                        <CommandList>
                          <CommandGroup>
                            {filteredCertifications?.map((cert) => (
                              <CommandItem
                                key={cert.id}
                                value={cert.name}
                                onSelect={() => {
                                  field.handleChange(cert.id);
                                  setComboboxOpen(false);
                                  setSearchValue("");
                                }}
                              >
                                <div className="flex w-full items-center">
                                  <div className="flex h-8 w-8 items-center justify-center">
                                    {cert.icon ? (
                                      <Image
                                        width={24}
                                        height={24}
                                        src={cert.icon}
                                        alt={cert.name}
                                        className="h-6 w-6 rounded object-contain"
                                      />
                                    ) : (
                                      <SquircleDashed className="h-6 w-6 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {cert.name}
                                      {cert.issuer && (
                                        <span className="text-muted-foreground">
                                          {" "}
                                          — {cert.issuer}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      field.state.value === cert.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          {filteredCertifications &&
                            filteredCertifications.length > 0 && (
                              <>
                                <Separator className="my-1" />
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => {
                                      setComboboxOpen(false);
                                      setShowCreateDialog(true);
                                      setSearchValue("");
                                    }}
                                  >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create new certification type
                                  </CommandItem>
                                </CommandGroup>
                              </>
                            )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {field.state.meta.errors.map((error) => (
                    <p key={error} className="text-red-500 text-sm">
                      {error}
                    </p>
                  ))}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="dateAchieved">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Date Achieved</Label>
                <Popover>
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
                      onSelect={(date) => field.handleChange(date)}
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
                <Popover>
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
                      onSelect={(date) => field.handleChange(date)}
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
                  Add Certification
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>

        {/* Nested dialog for creating new certification type */}
        <CreateCertificationTypeDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          nested={true}
          onSuccess={(newCertification) => {
            // Auto-select the newly created certification
            form.setFieldValue("certificationId", newCertification.id);
            setShowCreateDialog(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
