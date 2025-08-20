"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  User,
  Calendar,
  Users,
  ChevronRight,
  FileText,
  Link2,
  Package,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { useCreateClient, useProducts } from "@/features/clients/queries";
import { useRouter } from "next/navigation";
import type {
  ClientFormData,
  AssignmentData,
} from "@/features/clients/actions";

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  users?: Array<{
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  }>;
}

export function CreateClientModal({
  isOpen,
  onClose,
  users = [],
}: CreateClientModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    product_id: "",
    renewal_date: "",
    platform_link: "",
    onboarding_notes: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    assignments: [],
  });

  const { data: productsData = [] } = useProducts();

  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [selectedCsc, setSelectedCsc] = useState<string>("");
  const [currentSection, setCurrentSection] = useState<"basic" | "details">(
    "basic"
  );
  const router = useRouter();
  const createClientMutation = useCreateClient();

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Build assignments array based on selections
    const assignments: AssignmentData[] = [];

    if (selectedCoach && selectedCoach !== "none") {
      assignments.push({
        clientId: "", // Will be filled by the server
        userId: selectedCoach,
        assignmentType: "coach",
      });
    }

    if (selectedCsc && selectedCsc !== "none") {
      assignments.push({
        clientId: "",
        userId: selectedCsc,
        assignmentType: "csc",
      });
    }

    const submitData = {
      ...formData,
      assignments,
    };
    console.log("submitData", submitData);
    createClientMutation.mutate(submitData, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("Client created successfully!");
          onClose();
          router.refresh();
          // Reset form
          setFormData({
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            product_id: "",
            renewal_date: "",
            platform_link: "",
            onboarding_notes: "",
            start_date: new Date().toISOString().split("T")[0],
            end_date: "",
            assignments: [],
          });
          setSelectedCoach("");
          setSelectedCsc("");
          setCurrentSection("basic");
        }
      },
      onError: (error) => {
        toast.error("Failed to create client", {
          description: error.message,
        });
      },
    });
  };

  const isFormValid =
    formData.first_name && formData.last_name && formData.email;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Create New Client
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setCurrentSection("basic")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              currentSection === "basic"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setCurrentSection("details")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              currentSection === "details"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Details & Assignment
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {currentSection === "basic" ? (
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="first_name"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <User className="h-3 w-3" />
                    First Name
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      handleInputChange("first_name", e.target.value)
                    }
                    placeholder="John"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">
                    Last Name
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      handleInputChange("last_name", e.target.value)
                    }
                    placeholder="Doe"
                    className="h-10"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  Email
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john.doe@example.com"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-10"
                />
              </div>

              {/* Date Fields */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Important Dates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-sm font-medium">
                      Start Date
                    </Label>
                    <DatePicker
                      id="start_date"
                      value={
                        formData.start_date ||
                        new Date().toISOString().split("T")[0]
                      }
                      onChange={(value) =>
                        handleInputChange("start_date", value)
                      }
                      placeholder="Select start date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-sm font-medium">
                      End Date
                    </Label>
                    <DatePicker
                      id="end_date"
                      value={formData.end_date || ""}
                      onChange={(value) =>
                        handleInputChange("end_date", value)
                      }
                      placeholder="Select end date"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewal_date" className="text-sm font-medium">
                    Renewal Date
                  </Label>
                  <DatePicker
                    id="renewal_date"
                    value={formData.renewal_date || ""}
                    onChange={(value) =>
                      handleInputChange("renewal_date", value)
                    }
                    placeholder="Select renewal date"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label
                  htmlFor="product"
                  className="text-sm font-medium flex items-center gap-1"
                >
                  <Package className="h-3 w-3" />
                  Product
                </Label>
                <Select
                  value={formData.product_id || "none"}
                  onValueChange={(value) =>
                    handleInputChange(
                      "product_id",
                      value === "none" ? "" : value
                    )
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No product selected</SelectItem>
                    {productsData?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          {product.is_active && (
                            <span className="text-xs text-muted-foreground">
                              {product.is_active ? "Active" : "Inactive"}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Assignment */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Assignment
                </h3>

                {/* Coach Selection */}
                <div className="space-y-2">
                  <Label htmlFor="coach" className="text-sm font-medium">
                    Assign Coach
                  </Label>
                  <Select
                    value={selectedCoach || "none"}
                    onValueChange={setSelectedCoach}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a coach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No coach assigned</SelectItem>
                      {users
                        .filter((user) => user?.role === "coach")
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="text-xs">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm">{user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* CSC Selection */}
                <div className="space-y-2">
                  <Label htmlFor="csc" className="text-sm font-medium">
                    Assign Customer Success Coordinator
                  </Label>
                  <Select
                    value={selectedCsc || "none"}
                    onValueChange={setSelectedCsc}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a CSC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No CSC assigned</SelectItem>
                      {users
                        .filter((user) => user?.role === "csc")
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="text-xs">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm">{user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Platform Link */}
              <div className="space-y-2">
                <Label
                  htmlFor="platform_link"
                  className="text-sm font-medium flex items-center gap-1"
                >
                  <Link2 className="h-3 w-3" />
                  Platform Link
                </Label>
                <Input
                  id="platform_link"
                  type="url"
                  value={formData.platform_link || ""}
                  onChange={(e) =>
                    handleInputChange("platform_link", e.target.value)
                  }
                  placeholder="https://platform.example.com/client"
                  className="h-10"
                />
              </div>

              {/* Onboarding Notes */}
              <div className="space-y-2">
                <Label
                  htmlFor="onboarding_notes"
                  className="text-sm font-medium flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  Onboarding Notes
                </Label>
                <Textarea
                  id="onboarding_notes"
                  value={formData.onboarding_notes || ""}
                  onChange={(e) =>
                    handleInputChange("onboarding_notes", e.target.value)
                  }
                  placeholder="Add any notes about the client's onboarding process..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          <div className="text-sm text-muted-foreground">
            {currentSection === "basic" && "* Required fields"}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="h-9">
              Cancel
            </Button>
            {currentSection === "basic" ? (
              <Button
                onClick={() => setCurrentSection("details")}
                disabled={!isFormValid}
                className="h-9"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || createClientMutation.isPending}
                className="h-9"
              >
                {createClientMutation.isPending
                  ? "Creating..."
                  : "Create Client"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
