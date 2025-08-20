"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import { addSpecialization } from "@/features/coaches/actions/addSpecialization";
import { useAllSpecializations } from "@/features/coaches/queries/specializations";
import { IconDisplay } from "@/features/icons";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Plus, PlusCircle, SquircleDashed } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";
import CreateSpecializationDialog from "@/features/specializations/components/create-specialization-dialog";

// Schema matching the server action
const specializationSchema = z.object({
  specializationId: z.string().min(1, "Please select a specialization"),
  isPrimary: z.boolean(),
});

interface AddSpecializationDialogProps {
  userId: string;
}

export default function AddSpecializationDialog({
  userId,
}: AddSpecializationDialogProps) {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const queryClient = useQueryClient();

  // Fetch available specializations
  const { data: specializations, isLoading: specializationsLoading } =
    useAllSpecializations();

  const form = useForm({
    defaultValues: {
      specializationId: "",
      isPrimary: false,
    },
    onSubmit: async ({ value }) => {
      const result = await addSpecialization({
        userId,
        specializationId: value.specializationId,
        isPrimary: value.isPrimary,
      });

      if (result?.data?.success) {
        toast.success("Specialization added successfully!");
        setOpen(false);
        form.reset();
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ["specializations", "user", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["coaches", "detail", userId],
        });
      } else if (result?.validationErrors?._errors) {
        const errorMessage =
          result.validationErrors._errors[0] || "Failed to add specialization";
        toast.error(errorMessage);
      }
    },
    validators: {
      onSubmit: specializationSchema,
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Specialization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Specialization</DialogTitle>
          <DialogDescription>
            Add an area of expertise to this coach's profile.
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
            {(field) => {
              const selectedSpec = specializations?.find(
                (spec) => spec.id === field.state.value
              );
              
              const filteredSpecializations = specializations?.filter((spec) =>
                spec.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                spec.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
                spec.specialization_category?.name?.toLowerCase().includes(searchValue.toLowerCase())
              );

              // Group specializations by category
              const groupedSpecializations = filteredSpecializations?.reduce((acc, spec) => {
                const categoryName = spec.specialization_category?.name || "Uncategorized";
                if (!acc[categoryName]) {
                  acc[categoryName] = [];
                }
                acc[categoryName].push(spec);
                return acc;
              }, {} as Record<string, typeof filteredSpecializations>);

              return (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Specialization</Label>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxOpen}
                        className="w-full justify-between"
                        disabled={specializationsLoading}
                      >
                        {selectedSpec ? (
                          <div className="flex items-center gap-3">
                            <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded bg-muted">
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                {selectedSpec.icon ? (
                                  <IconDisplay
                                    iconKey={selectedSpec.icon}
                                    className="h-4 w-4"
                                  />
                                ) : (
                                  <SquircleDashed className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="font-medium">
                                {selectedSpec.name}
                              </div>
                              {selectedSpec.specialization_category?.name && (
                                <div className="text-xs text-muted-foreground">
                                  {selectedSpec.specialization_category.name}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span>Select a specialization</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search specializations..."
                          value={searchValue}
                          onValueChange={setSearchValue}
                        />
                        <CommandList>
                          {groupedSpecializations && Object.entries(groupedSpecializations).map(([category, specs]) => (
                            <CommandGroup key={category} heading={category}>
                              {specs?.map((spec) => (
                                <CommandItem
                                  key={spec.id}
                                  value={spec.name}
                                  onSelect={() => {
                                    field.handleChange(spec.id);
                                    setComboboxOpen(false);
                                    setSearchValue("");
                                  }}
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-muted">
                                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        {spec.icon ? (
                                          <IconDisplay
                                            iconKey={spec.icon}
                                            className="h-4 w-4"
                                          />
                                        ) : (
                                          <SquircleDashed className="h-4 w-4" />
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">
                                        {spec.name}
                                      </div>
                                      {spec.description && (
                                        <div className="text-xs text-muted-foreground truncate">
                                          {spec.description}
                                        </div>
                                      )}
                                    </div>
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        field.state.value === spec.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                          {filteredSpecializations && filteredSpecializations.length > 0 && (
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
                                  Create new specialization
                                </CommandItem>
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500 text-sm">
                      {error?.message}
                    </p>
                  ))}
                </div>
              );
            }}
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
                  Add Specialization
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>

        {/* Nested dialog for creating new specialization */}
        <CreateSpecializationDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={(newSpecialization) => {
            // Auto-select the newly created specialization
            form.setFieldValue("specializationId", newSpecialization.id);
            setShowCreateDialog(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
