import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";

import { useState, useEffect } from "react";
import { Edit3, Save, X, MessageSquare, Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

interface ClientTestimonialBasicInfoProps {
  testimonial: {
    client_id?: string | null;
    client_name?: string;
    testimonial_type: string;
    content: string;
    testimonial_url?: string | null;
    recorded_date: string;
    recorded_by?: string | null;
    recorded_by_name?: string;
  };
  isEditing?: boolean;
  onEditToggle?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export function ClientTestimonialBasicInfo({
  testimonial,
  isEditing = false,
  onEditToggle,
  onSave,
  onCancel,
}: ClientTestimonialBasicInfoProps) {
  const [formData, setFormData] = useState<{
    client_id: string;
    testimonial_type: string;
    content: string;
    testimonial_url: string;
    recorded_date: string;
    recorded_by: string;
  }>({
    client_id: testimonial.client_id ? String(testimonial.client_id) : "none",
    testimonial_type: testimonial.testimonial_type,
    content: testimonial.content,
    testimonial_url: testimonial.testimonial_url || "",
    recorded_date: testimonial.recorded_date,
    recorded_by: testimonial.recorded_by
      ? String(testimonial.recorded_by)
      : "none",
  });

  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [teamMemberSearchOpen, setTeamMemberSearchOpen] = useState(false);

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["clients", "active"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("clients")
        .select("id, name, email")
        .order("name");

      // Ensure unique by id
      const uniqueClients = data
        ? Array.from(
            new Map(data.map((client) => [client.id, client])).values()
          )
        : [];

      return uniqueClients;
    },
    enabled: isEditing,
  });

  // Fetch team members for dropdown
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members", "active"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("team_members")
        .select("user_id, name")
        .not("user_id", "is", null)
        .order("name");
      const uniqueTeamMembers = data
        ? Array.from(
            new Map(data.map((member) => [member.user_id, member])).values()
          )
        : [];

      return uniqueTeamMembers || [];
    },
    enabled: isEditing,
  });
console.log(teamMembers)
  // Reset form data when testimonial changes
  useEffect(() => {
    setFormData({
      client_id: testimonial.client_id ? String(testimonial.client_id) : "none",
      testimonial_type: testimonial.testimonial_type,
      content: testimonial.content,
      testimonial_url: testimonial.testimonial_url || "",
      recorded_date: testimonial.recorded_date,
      recorded_by: testimonial.recorded_by
        ? String(testimonial.recorded_by)
        : "none",
    });
  }, [testimonial]);

  const handleSave = () => {
    // Convert "none" back to null before saving
    const dataToSave = {
      ...formData,
      client_id: formData.client_id === "none" ? null : formData.client_id,
      recorded_by:
        formData.recorded_by === "none" ? null : formData.recorded_by,
    };
    onSave?.(dataToSave);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      client_id: testimonial.client_id ? String(testimonial.client_id) : "none",
      testimonial_type: testimonial.testimonial_type,
      content: testimonial.content,
      testimonial_url: testimonial.testimonial_url || "",
      recorded_date: testimonial.recorded_date,
      recorded_by: testimonial.recorded_by
        ? String(testimonial.recorded_by)
        : "none",
    });
    onCancel?.();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Testimonial Details
          </div>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditToggle}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Client
          </label>
          {isEditing ? (
            <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientSearchOpen}
                  className="w-full justify-between font-normal h-10 mt-1"
                >
                  {formData.client_id !== "none"
                    ? clients.find(
                        (client: any) => String(client.id) === formData.client_id
                      )?.name || "Select a client"
                    : "No client selected"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                align="start"
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <Command>
                  <CommandInput
                    placeholder="Search clients..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No client found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          setFormData((prev) => ({
                            ...prev,
                            client_id: "none",
                          }));
                          setClientSearchOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.client_id === "none"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        No client selected
                      </CommandItem>
                      {clients.map((client: any) => (
                        <CommandItem
                          key={client.id}
                          value={client.name}
                          onSelect={() => {
                            setFormData((prev) => ({
                              ...prev,
                              client_id: String(client.id),
                            }));
                            setClientSearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.client_id === String(client.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{client.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {client.email}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <p className="text-sm">
              {testimonial.client_name || "No client assigned"}
            </p>
          )}
        </div>

        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Testimonial Type
          </label>
          {isEditing ? (
            <Select
              value={formData.testimonial_type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, testimonial_type: value }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="written">Written</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm">
              <StatusBadge>{testimonial.testimonial_type}</StatusBadge>
            </div>
          )}
        </div>

        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Content
          </label>
          {isEditing ? (
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              className="mt-1"
              rows={6}
              placeholder="Enter testimonial content"
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{testimonial.content}</p>
          )}
        </div>

        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Testimonial URL
          </label>
          {isEditing ? (
            <Input
              type="url"
              value={formData.testimonial_url}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  testimonial_url: e.target.value,
                }))
              }
              placeholder="https://example.com/testimonial"
              className="mt-1"
            />
          ) : (
            <p className="text-sm">
              {testimonial.testimonial_url ? (
                <a
                  href={testimonial.testimonial_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {testimonial.testimonial_url}
                </a>
              ) : (
                "No URL provided"
              )}
            </p>
          )}
        </div>

        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Recorded Date
          </label>
          {isEditing ? (
            <Input
              type="date"
              value={formatDate(formData.recorded_date)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  recorded_date: e.target.value,
                }))
              }
              className="mt-1"
            />
          ) : (
            <p className="text-sm">
              {new Date(testimonial.recorded_date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div>
          <label className="font-medium text-muted-foreground text-sm">
            Recorded By
          </label>
          {isEditing ? (
            <Popover open={teamMemberSearchOpen} onOpenChange={setTeamMemberSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={teamMemberSearchOpen}
                  className="w-full justify-between font-normal h-10 mt-1"
                >
                  {formData.recorded_by !== "none"
                    ? teamMembers.find(
                        (member: any) => String(member.user_id) === formData.recorded_by
                      )?.name || "Select team member"
                    : "No team member selected"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                align="start"
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <Command>
                  <CommandInput
                    placeholder="Search team members..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No team member found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          setFormData((prev) => ({
                            ...prev,
                            recorded_by: "none",
                          }));
                          setTeamMemberSearchOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.recorded_by === "none"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        No team member selected
                      </CommandItem>
                      {teamMembers.map((member: any) => (
                        <CommandItem
                          key={member.user_id}
                          value={member.name}
                          onSelect={() => {
                            setFormData((prev) => ({
                              ...prev,
                              recorded_by: String(member.user_id),
                            }));
                            setTeamMemberSearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.recorded_by === String(member.user_id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {member.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <p className="text-sm">
              {testimonial.recorded_by_name || "Unknown"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
