"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createCoach, type CreateCoachInput } from "../actions/create-coach";
import { Loader2 } from "lucide-react";

interface CoachFormProps {
  teams?: Array<{ id: string; name: string; email?: string }>;
}

export function CoachForm({ teams = [] }: CoachFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCoachInput>({
    name: "",
    email: "",
    onboarding_date: "",
    contract_type: "",
    roles: "",
    team_id: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(formData);
    try {
      const result = await createCoach(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/coaches");
      }
    } catch (error) {
      console.error("Error creating coach:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create coach"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateCoachInput,
    value: string | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const contractTypes = ["Hourly", "W2"];

  const roleOptions = ["Coach", "Premier Coach"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter coach name"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="coach@example.com"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Onboarding Date Field */}
        <div className="space-y-2">
          <Label htmlFor="onboarding_date">Onboarding Date</Label>
          <Input
            id="onboarding_date"
            type="date"
            value={formData.onboarding_date || ""}
            onChange={(e) =>
              handleInputChange("onboarding_date", e.target.value)
            }
            disabled={isSubmitting}
          />
        </div>

        {/* Contract Type Field */}
        <div className="space-y-2">
          <Label htmlFor="contract_type">Contract Type</Label>
          <Select
            value={formData.contract_type || ""}
            onValueChange={(value) => handleInputChange("contract_type", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="contract_type">
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent>
              {contractTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Roles Field */}
        <div className="space-y-2">
          <Label htmlFor="roles">Roles</Label>
          <Select
            value={formData.roles || ""}
            onValueChange={(value) => handleInputChange("roles", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="roles">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            You can also enter multiple roles separated by commas
          </p>
          <Input
            type="text"
            value={formData.roles || ""}
            onChange={(e) => handleInputChange("roles", e.target.value)}
            placeholder="e.g., Coach, Team Lead"
            disabled={isSubmitting}
          />
        </div>

        {/* Team Field */}
        <div className="space-y-2">
          <Label htmlFor="team_id">Team Assignment</Label>
          <Select
            value={formData.team_id || ""}
            onValueChange={(value) =>
              handleInputChange("team_id", value || null)
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="team_id">
              <SelectValue placeholder="Select premier coach / team leader (optional)" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name} {team.email && `(${team.email})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Assign this coach to work under a premier coach or team leader
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Creating..." : "Create Coach"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/coaches")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
