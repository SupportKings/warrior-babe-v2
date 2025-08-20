"use client";

import { useEffect, useState } from "react";

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

import { updateSystemSettings } from "@/features/system-settings/actions/update-settings";
import { useSystemSettings } from "@/features/system-settings/queries/system-settings";
import { getSettingValue } from "@/features/system-settings/utils/parse-setting";

import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

interface SystemSettingsDialogProps {
  trigger: React.ReactNode;
}

const SETTINGS_KEYS = [
  "global_default_client_units_per_coach",
  "default_coach_capacity",
];

export function SystemSettingsDialog({ trigger }: SystemSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    globalDefaultClientUnits: "",
    defaultCoachCapacity: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useSystemSettings(SETTINGS_KEYS);

  // Initialize form values when settings load
  useEffect(() => {
    if (settings && settings.length > 0) {
      const globalDefaultSetting = settings.find(
        (s) => s.setting_key === "global_default_client_units_per_coach"
      );
      const defaultCapacitySetting = settings.find(
        (s) => s.setting_key === "default_coach_capacity"
      );

      setFormValues({
        globalDefaultClientUnits: getSettingValue(
          globalDefaultSetting,
          20
        ).toString(),
        defaultCoachCapacity: getSettingValue(
          defaultCapacitySetting,
          20
        ).toString(),
      });
    }
  }, [settings]);

  const { execute: executeUpdate, isExecuting } = useAction(
    updateSystemSettings,
    {
      onSuccess: () => {
        setShowSuccess(true);
        setShowError(false);

        // Invalidate all affected queries
        queryClient.invalidateQueries({ queryKey: ["capacity"] });
        queryClient.invalidateQueries({ queryKey: ["coaches"] });
        queryClient.invalidateQueries({ queryKey: ["system-settings"] });

        // Auto-close after showing success
        setTimeout(() => {
          setOpen(false);
          setShowSuccess(false);
        }, 2000);
      },
      onError: ({ error }) => {
        console.error("Failed to update system settings:", error);
        setErrorMessage("Failed to update system settings. Please try again.");
        setShowError(true);
        setShowSuccess(false);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const globalUnits = Number.parseFloat(formValues.globalDefaultClientUnits);
    const coachCapacity = Number.parseFloat(formValues.defaultCoachCapacity);

    if (Number.isNaN(globalUnits) || globalUnits <= 0) {
      setErrorMessage("Global default client units must be a positive number.");
      setShowError(true);
      return;
    }

    if (Number.isNaN(coachCapacity) || coachCapacity <= 0) {
      setErrorMessage("Default coach capacity must be a positive number.");
      setShowError(true);
      return;
    }

    // Clear any previous messages
    setShowError(false);
    setShowSuccess(false);

    // Execute update
    executeUpdate({
      settings: [
        {
          key: "global_default_client_units_per_coach",
          value: globalUnits,
          dataType: "integer",
          description:
            "Default number of client units assigned to each coach when no specific capacity is set",
        },
        {
          key: "default_coach_capacity",
          value: coachCapacity,
          dataType: "integer",
          description: "Default maximum capacity for new coaches",
        },
      ],
    });
  };

  const hasChanges = () => {
    if (!settings || settings.length === 0) return false;

    const globalDefaultSetting = settings.find(
      (s) => s.setting_key === "global_default_client_units_per_coach"
    );
    const defaultCapacitySetting = settings.find(
      (s) => s.setting_key === "default_coach_capacity"
    );

    const currentGlobalUnits = getSettingValue(globalDefaultSetting, 20);
    const currentCapacity = getSettingValue(defaultCapacitySetting, 20);

    const newGlobalUnits = Number.parseFloat(
      formValues.globalDefaultClientUnits
    );
    const newCapacity = Number.parseFloat(formValues.defaultCoachCapacity);

    return (
      !Number.isNaN(newGlobalUnits) &&
      !Number.isNaN(newCapacity) &&
      (newGlobalUnits !== currentGlobalUnits || newCapacity !== currentCapacity)
    );
  };

  return (
    <Dialog open={open} onOpenChange={!isExecuting ? setOpen : undefined}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>System Settings</DialogTitle>
          <DialogDescription>
            Configure global capacity settings that apply to all coaches.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading settings...</span>
          </div>
        ) : (
          <>
            {showSuccess && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 text-sm">
                      System settings updated successfully!
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuccess(false)}
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {showError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800 text-sm">
                      {errorMessage}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowError(false)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="globalDefaultClientUnits">
                    Global Default Client Units per Coach
                  </Label>
                  <Input
                    id="globalDefaultClientUnits"
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={formValues.globalDefaultClientUnits}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        globalDefaultClientUnits: e.target.value,
                      }))
                    }
                    placeholder="20"
                    disabled={isExecuting}
                  />
                  <p className="text-muted-foreground text-xs">
                    Default client units assigned when a coach doesn't have a
                    specific capacity set.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultCoachCapacity">
                    Default Coach Client Capacity
                  </Label>
                  <Input
                    id="defaultCoachCapacity"
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={formValues.defaultCoachCapacity}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        defaultCoachCapacity: e.target.value,
                      }))
                    }
                    placeholder="20"
                    disabled={isExecuting}
                  />
                  <p className="text-muted-foreground text-xs">
                    Default maximum capacity for new coaches.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isExecuting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isExecuting || !hasChanges()}>
                  {isExecuting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
