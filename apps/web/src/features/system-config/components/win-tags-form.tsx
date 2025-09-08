"use client";

import { useState, useRef, useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerOutput,
  ColorPickerEyeDropper,
} from "@/components/ui/shadcn-io/color-picker/index";

import { createWinTag } from "@/features/system-config/actions/createWinTags";
import {
  validateSingleField,
  type WinTag,
  type WinTagForm,
} from "@/features/system-config/types/win-tags";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface WinTagsFormProps {
  mode?: "create" | "edit";
  initialData?: WinTag;
  onSuccess?: () => void;
}

// Convert RGB array to hex
function rgbToHex(rgb: number[]): string {
  const [r, g, b] = rgb;
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16).padStart(2, '0');
    return hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, ms = 120) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function WinTagsForm({
  mode = "create",
  initialData,
  onSuccess,
}: WinTagsFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Color picker state and handlers at top level
  const lastHexRef = useRef(initialData?.color || "#3b82f6");
  
  const commitHex = useCallback((hex: string, fieldHandler: (value: string) => void) => {
    if (hex !== lastHexRef.current) {
      lastHexRef.current = hex;
      fieldHandler(hex);
    }
  }, []);
  
  const handlePickerChange = useMemo(
    () => debounce((value: any, fieldHandler: (value: string) => void) => {
      // The picker returns RGB array [r, g, b, a]
      if (Array.isArray(value) && value.length >= 3) {
        const hex = rgbToHex(value);
        commitHex(hex, fieldHandler);
      }
    }, 120),
    [commitHex]
  );

  const form = useForm({
    defaultValues: {
      name: initialData?.name || "",
      color: initialData?.color || "#3b82f6",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      try {
        if (mode === "create") {
			console.log(value)
          const result = await createWinTag({color: value.color, name: value.name});
		  console.log(result)
          if (result?.validationErrors) {
            // Handle field-specific errors
            const fieldErrors = result.validationErrors as Record<string, any>;
            for (const [field, error] of Object.entries(fieldErrors)) {
              if (field === "_errors") {
                toast.error(error[0]);
              } else if (error?._errors) {
                form.setFieldMeta(field as keyof WinTagForm, (meta) => ({
                  ...meta,
                  errors: error._errors,
                }));
              }
            }
            setIsSubmitting(false);
            return;
          }

          if (result?.data) {
            // Invalidate React Query caches
            await queryClient.invalidateQueries({ queryKey: ["win-tags"] });

            toast.success("Win tag created successfully!");

            if (onSuccess) {
              onSuccess();
            } else {
              router.push("/dashboard/system-config/client-win-tags");
            }
          }
        }
        // Handle edit mode here if needed
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="space-y-6">
        <h3>Basic Information</h3>
        {/* Basic Information Section */}

        <form.Field
          name="name"
          validators={{
            onBlur: ({ value }) => {
              const result = validateSingleField("name", value);
              return result.success ? undefined : result.error;
            },
            onChange: ({ value }) => {
              const result = validateSingleField("name", value);
              return result.success ? undefined : result.error;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="name" className="required">
                Tag Name
              </Label>
              <Input
                id="name"
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter tag name"
                className={
                  field.state.meta.errors.length > 0 ? "border-destructive" : ""
                }
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-sm">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="color"
          validators={{
            onBlur: ({ value }) => {
              const result = validateSingleField("color", value);
              return result.success ? undefined : result.error;
            },
            onChange: ({ value }) => {
              const result = validateSingleField("color", value);
              return result.success ? undefined : result.error;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="color" className="required">
                Tag Color
              </Label>
              
              {/* Don't bind value to prevent render loop */}
              <ColorPicker
                defaultValue={field.state.value}
                onChange={(value) => handlePickerChange(value, field.handleChange)}
                className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
              >
                <ColorPickerSelection className="h-[300px] w-full" />
                <div className="flex items-center gap-4">
                  <ColorPickerEyeDropper />
                  <div className="grid w-full gap-1">
                    <ColorPickerHue />
                    <ColorPickerAlpha />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ColorPickerOutput />
                  <ColorPickerFormat />
                </div>
              </ColorPicker>
              
              {/* Manual hex input */}
              <Input
                id="color"
                type="text"
                value={field.state.value}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === "#") {
                    field.handleChange(value);
                  }
                }}
                onBlur={field.handleBlur}
                placeholder="#3B82F6"
                className="font-mono"
              />
              
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-sm">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Creating..."
              : mode === "edit"
              ? "Update Win Tag"
              : "Create Win Tag"}
          </Button>
        </div>
      </div>
    </form>
  );
}
