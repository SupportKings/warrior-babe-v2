"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { usePermissions } from "@/hooks/useUser";

import { Button } from "@/components/ui/button";

import { PlusIcon, SettingsIcon } from "lucide-react";
import { ManageTemplateDialog } from "../components/ManageTemplateDialog";
import { StartOnboardingDialog } from "../components/StartOnboardingDialog";

export function OnboardingHeader() {
  const router = useRouter();
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const { canEditOnboardingTemplates } = usePermissions();

  return (
    <>
      <div className="flex h-[45px] items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="font-medium text-[13px]">Onboarding Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          {canEditOnboardingTemplates && (
            <Button
              variant="outline"
              onClick={() => setTemplateDialogOpen(true)}
            >
              <SettingsIcon className="mr-2 h-4 w-4" />
              Manage Template
            </Button>
          )}

          <Button onClick={() => setStartDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Start Onboarding
          </Button>
        </div>
      </div>

      <StartOnboardingDialog
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
      />

      <ManageTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />
    </>
  );
}
