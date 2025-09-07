"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";

import { createClientTestimonial } from "@/features/client-testimonials/actions/createClientTestimonials";
import {
  validateSingleField,
  TESTIMONIAL_TYPE_OPTIONS,
  type ClientTestimonialForm,
} from "@/features/client-testimonials/types/client-testimonials";

interface ClientTestimonialsFormProps {
  initialData?: Partial<ClientTestimonialForm>;
  onSuccess?: () => void;
  clients?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string }>;
}

export function ClientTestimonialsForm({
  initialData,
  onSuccess,
  clients = [],
  users = [],
}: ClientTestimonialsFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      client_id: initialData?.client_id || "",
      content: initialData?.content || "",
      recorded_by: initialData?.recorded_by || "",
      recorded_date:
        initialData?.recorded_date || new Date().toISOString().split("T")[0],
      testimonial_type: initialData?.testimonial_type || "written",
      testimonial_url: initialData?.testimonial_url || "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        // Transform empty strings to null for optional fields and ensure correct types
        const transformedData = {
          ...value,
          client_id: value.client_id || null,
          recorded_by: value.recorded_by || null,
          testimonial_url: value.testimonial_url || null,
          testimonial_type: value.testimonial_type as
            | "written"
            | "email"
            | "video",
        };
        console.log(transformedData);
        const result = await createClientTestimonial(transformedData as any);
        console.log(result);

        if (result?.data?.success) {
          toast.success("Testimonial created successfully");

          // Invalidate queries
          await queryClient.invalidateQueries({
            queryKey: ["client-testimonials"],
          });
          if (transformedData.client_id) {
            await queryClient.invalidateQueries({
              queryKey: ["client", transformedData.client_id],
            });
          }

          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/dashboard/clients/testimonials");
          }
        } else {
          // Handle validation errors
          const errors = result?.validationErrors;
          if (errors) {
            Object.entries(errors).forEach(([field, error]) => {
              if (field === "_errors" && Array.isArray(error)) {
                toast.error(error[0]);
              } else if (typeof error === "object" && "_errors" in error) {
                toast.error(error._errors?.[0] || "Validation error");
              }
            });
          } else {
            toast.error("Failed to create testimonial");
          }
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  console.log(form.getAllErrors());
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <h3>Basic Information</h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Client */}
        <form.Field
          name="client_id"
          validators={{
            onBlur: ({ value }) => {
              const result = validateSingleField("client_id", value);
              return result.success ? undefined : result.error;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              <Combobox
                value={field.state.value}
                onValueChange={field.handleChange}
                placeholder="Select a client"
                emptyText="No clients found"
                searchPlaceholder="Search clients..."
                options={clients.map((client) => ({
                  value: client.id,
                  label: client.name,
                }))}
                className="h-10"
              />
              {field.state.meta.errors && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Testimonial Type */}
        <form.Field
          name="testimonial_type"
          validators={{
            onBlur: ({ value }) => {
              const result = validateSingleField("testimonial_type", value);
              return result.success ? undefined : result.error;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="testimonial_type">Testimonial Type *</Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger id="testimonial_type" className="h-10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TESTIMONIAL_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recorded Date */}
        <form.Field
          name="recorded_date"
          validators={{
            onBlur: ({ value }) => {
              const result = validateSingleField("recorded_date", value);
              return result.success ? undefined : result.error;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="recorded_date">Recorded Date *</Label>
              <DatePicker
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                placeholder="Select date"
                className="h-10"
              />
              {field.state.meta.errors && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Recorded By */}
        <form.Field
          name="recorded_by"
          validators={{
            onBlur: ({ value }) => {
              const result = validateSingleField("recorded_by", value);
              return result.success ? undefined : result.error;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="recorded_by">Recorded By</Label>
              <Combobox
                value={field.state.value}
                onValueChange={field.handleChange}
                placeholder="Select user"
                emptyText="No users found"
                searchPlaceholder="Search users..."
                options={users.map((user) => ({
                  value: user.id,
                  label: user.name,
                }))}
                className="h-10"
              />
              {field.state.meta.errors && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      {/* Testimonial URL */}
      <form.Field
        name="testimonial_url"
        validators={{
          onBlur: ({ value }) => {
            const result = validateSingleField("testimonial_url", value);
            return result.success ? undefined : result.error;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="testimonial_url">Testimonial URL</Label>
            <Input
              id="testimonial_url"
              type="url"
              placeholder="https://example.com/testimonial"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="h-10"
            />
            {field.state.meta.errors && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Content */}
      <form.Field
        name="content"
        validators={{
          onBlur: ({ value }) => {
            const result = validateSingleField("content", value);
            return result.success ? undefined : result.error;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Enter testimonial content..."
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              rows={6}
              className="resize-none"
            />
            {field.state.meta.errors && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Testimonial"}
        </Button>
      </div>
    </form>
  );
}
