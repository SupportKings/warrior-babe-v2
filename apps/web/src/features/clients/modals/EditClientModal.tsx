"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, User, Calendar, Users, ChevronRight, FileText, Link2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { useUpdateClient, useClientAssignments, useProducts, useAssignUserToClient, useRemoveAssignment } from "@/features/clients/queries";
import { useRouter } from "next/navigation";
import type { ClientFormData, AssignmentData } from "@/features/clients/actions";
import { usePermissions } from "@/hooks/useUser";

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  users?: Array<{ 
    id: string; 
    name: string; 
    email: string; 
    image?: string | null;
    role?: string;
  }>;
}

export function EditClientModal({ isOpen, onClose, client, users = [] }: EditClientModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    product_id: "",
    renewal_date: "",
    platform_link: "",
    onboarding_notes: "",
    status: "active",
    start_date: "",
    end_date: "",
    assignments: []
  });
  
  const { data: productsData = [] } = useProducts();
  
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [selectedCsc, setSelectedCsc] = useState<string>("");
  const [originalCoach, setOriginalCoach] = useState<string>("");
  const [originalCsc, setOriginalCsc] = useState<string>("");
  const [currentSection, setCurrentSection] = useState<"basic" | "details">("basic");
  const router = useRouter();
  const updateClientMutation = useUpdateClient({ showToast: false });
  const assignUserMutation = useAssignUserToClient({ showToast: false });
  const removeAssignmentMutation = useRemoveAssignment({ showToast: false });
  const { canEditClients } = usePermissions();
  
  // Fetch current assignments only if client exists
  const { data: assignments = [] } = useClientAssignments(client?.id || "", {
    enabled: !!client?.id
  });

  // Populate form data when client changes
  useEffect(() => {
    if (client) {
      setFormData({
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        email: client.email || "",
        phone: client.phone || "",
        product_id: client.product_id || "",
        renewal_date: client.renewal_date || "",
        platform_link: client.platform_link || "",
        onboarding_notes: client.onboarding_notes || "",
        status: client.status || "active",
        start_date: client.start_date || "",
        end_date: client.end_date || "",
        assignments: []
      });
    }
  }, [client]);

  // Set current assignments when they change
  useEffect(() => {
    if (assignments && assignments.length > 0) {
      const currentCoach = assignments.find((a: any) => a.assignment_type === "coach" && !a.end_date);
      const currentCsc = assignments.find((a: any) => a.assignment_type === "csc" && !a.end_date);
      
      setSelectedCoach(currentCoach?.user_id || "");
      setSelectedCsc(currentCsc?.user_id || "");
      setOriginalCoach(currentCoach?.user_id || "");
      setOriginalCsc(currentCsc?.user_id || "");
    }
  }, [assignments]);

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Update client first
      const updateResult = await updateClientMutation.mutateAsync({ id: client.id, data: formData });
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      // Handle coach assignment changes
      if (selectedCoach !== originalCoach) {
        if (originalCoach && originalCoach !== "none") {
          // Remove old coach assignment
          const removeResult = await removeAssignmentMutation.mutateAsync({
            clientId: client.id,
            userId: originalCoach,
            assignmentType: "coach"
          });
          if (!removeResult.success) {
            throw new Error(removeResult.error);
          }
        }
        
        if (selectedCoach && selectedCoach !== "none") {
          // Add new coach assignment
          const assignResult = await assignUserMutation.mutateAsync({
            clientId: client.id,
            userId: selectedCoach,
            assignmentType: "coach"
          });
          if (!assignResult.success) {
            throw new Error(assignResult.error);
          }
        }
      }

      // Handle CSC assignment changes
      if (selectedCsc !== originalCsc) {
        if (originalCsc && originalCsc !== "none") {
          // Remove old CSC assignment
          const removeResult = await removeAssignmentMutation.mutateAsync({
            clientId: client.id,
            userId: originalCsc,
            assignmentType: "csc"
          });
          if (!removeResult.success) {
            throw new Error(removeResult.error);
          }
        }
        
        if (selectedCsc && selectedCsc !== "none") {
          // Add new CSC assignment
          const assignResult = await assignUserMutation.mutateAsync({
            clientId: client.id,
            userId: selectedCsc,
            assignmentType: "csc"
          });
          if (!assignResult.success) {
            throw new Error(assignResult.error);
          }
        }
      }

      toast.success("Client updated successfully!");
      onClose();
      router.refresh();
      setCurrentSection("basic");
    } catch (error) {
      toast.error("Failed to update client", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Update error:", error);
    }
  };

  const isFormValid = formData.first_name && formData.last_name && formData.email;

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Edit Client - {client.first_name} {client.last_name}
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
                  <Label htmlFor="first_name" className="text-sm font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    First Name
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    placeholder="John"
                    className="h-10"
                    disabled={!canEditClients}
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
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    placeholder="Doe"
                    className="h-10"
                    disabled={!canEditClients}
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
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
                  disabled={!canEditClients}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-10"
                  disabled={!canEditClients}
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
                      value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ""}
                      onChange={(value) => handleInputChange("start_date", value)}
                      placeholder="Select start date"
                      disabled={!canEditClients}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-sm font-medium">
                      End Date
                    </Label>
                    <DatePicker
                      id="end_date"
                      value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ""}
                      onChange={(value) => handleInputChange("end_date", value)}
                      placeholder="Select end date"
                      disabled={!canEditClients}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewal_date" className="text-sm font-medium">
                    Renewal Date
                  </Label>
                  <DatePicker
                    id="renewal_date"
                    value={formData.renewal_date ? new Date(formData.renewal_date).toISOString().split('T')[0] : ""}
                    onChange={(value) => handleInputChange("renewal_date", value)}
                    placeholder="Select renewal date"
                    disabled={!canEditClients}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product" className="text-sm font-medium flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Product
                </Label>
                <Select value={formData.product_id || "none"} onValueChange={(value) => handleInputChange("product_id", value === "none" ? "" : value)} disabled={!canEditClients}>
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
                    disabled={!canEditClients}
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
                    disabled={!canEditClients}
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
                <Label htmlFor="platform_link" className="text-sm font-medium flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Platform Link
                </Label>
                <Input
                  id="platform_link"
                  type="url"
                  value={formData.platform_link || ""}
                  onChange={(e) => handleInputChange("platform_link", e.target.value)}
                  placeholder="https://platform.example.com/client"
                  className="h-10"
                  disabled={!canEditClients}
                />
              </div>

              {/* Onboarding Notes */}
              <div className="space-y-2">
                <Label htmlFor="onboarding_notes" className="text-sm font-medium flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Onboarding Notes
                </Label>
                <Textarea
                  id="onboarding_notes"
                  value={formData.onboarding_notes || ""}
                  onChange={(e) => handleInputChange("onboarding_notes", e.target.value)}
                  placeholder="Add any notes about the client's onboarding process..."
                  rows={4}
                  className="resize-none"
                  disabled={!canEditClients}
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
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9"
            >
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
                disabled={!isFormValid || updateClientMutation.isPending || assignUserMutation.isPending || removeAssignmentMutation.isPending}
                className="h-9"
              >
                {(updateClientMutation.isPending || assignUserMutation.isPending || removeAssignmentMutation.isPending) ? "Updating..." : "Update Client"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}