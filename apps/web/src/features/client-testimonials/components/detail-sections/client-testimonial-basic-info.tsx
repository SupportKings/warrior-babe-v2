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
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";

import { useState, useEffect } from "react";
import { Edit3, Save, X, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

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
            <Select
              value={formData.client_id}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  client_id: value,
                }));
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No client selected</SelectItem>
                {clients.map((client: any) => (
                  <SelectItem key={client.id} value={String(client.id)}>
                    {client.name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select
              value={formData.recorded_by}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  recorded_by: value,
                }));
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No team member selected</SelectItem>
                {teamMembers.map((member: any) => (
                  <SelectItem
                    key={member.user_id}
                    value={String(member.user_id)}
                  >
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
