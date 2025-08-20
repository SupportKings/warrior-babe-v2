"use client";

import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { ArrowRight } from "lucide-react";
import type { CoachClient } from "../types/coach-profile";

interface CoachClientsListProps {
  clients: CoachClient[];
  isLoading?: boolean;
}

export default function CoachClientsList({
  clients,
  isLoading,
}: CoachClientsListProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "default";
      case "paused":
        return "secondary";
      case "at-risk":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            No clients currently assigned
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Current Clients (will get replaced by table once clients page is
            done to ensure consitent ui/ux)
          </CardTitle>
          <Badge variant="secondary">{clients.length} clients</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getInitials(client.first_name, client.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {client.first_name} {client.last_name}
                    </p>
                    <Badge
                      variant={getStatusColor(client.status)}
                      className="text-xs"
                    >
                      {client.status || "Active"}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-muted-foreground text-sm">
                    <span>
                      Started {new Date(client.start_date).toLocaleDateString()}
                    </span>
                    {client.total_sessions && (
                      <span>{client.total_sessions} sessions</span>
                    )}
                    {client.nps_score && (
                      <span>NPS: {client.nps_score}/10</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-sm">Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={client.progress_percentage || 0}
                      className="h-2 w-20"
                    />
                    <span className="text-muted-foreground text-xs">
                      {client.progress_percentage || 0}%
                    </span>
                  </div>
                </div>
                <Link href={`/dashboard/clients/${client.id}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
