"use client";

import Image from "next/image";
import { format } from "date-fns";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar, Mail, User, Users, Briefcase, Crown } from "lucide-react";
import { getContractTypeBadgeClass } from "../../utils";

interface CoachGeneralInfoProps {
  coach: any; // You can define a proper type for coach
}

export function CoachGeneralInfo({ coach }: CoachGeneralInfoProps) {
  const roles = coach.user?.role || null;
  
  const rolesList = roles
    ? roles
        .split(",")
        .map((role: string) => role.trim())
        .filter(Boolean)
    : [];

  const getInitials = (name: string | null) => {
    if (!name) return "TM";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {coach.user?.image ? (
              <Image src={coach.user.image} alt={""} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-lg font-semibold">
                {getInitials(coach.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {coach.name || "Unknown"}
            </CardTitle>
            <p className="text-muted-foreground">
              {coach.user?.email || "No email"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Name */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Name</span>
            </div>
            <p className="font-medium">{coach.name || "Not provided"}</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <p className="font-medium">
              {coach.user?.email || "Not provided"}
            </p>
          </div>

          {/* Contract Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Contract Type</span>
            </div>
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getContractTypeBadgeClass(
                coach.contract_type
              )}`}
            >
              {coach.contract_type}{" "}
            </span>
          </div>

          {/* Onboarding Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Onboarding Date</span>
            </div>
            <p className="font-medium">{formatDate(coach.onboarding_date)}</p>
          </div>

          {/* Assigned Premier Coach */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="h-4 w-4" />
              <span>Premier Coach</span>
            </div>
            <p className="font-medium">
              {coach.team?.premier_coach?.name || "Not assigned"}
            </p>
          </div>

          {/* User Roles */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Roles</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {!rolesList && (
                <span className="text-sm text-muted-foreground">
                  No roles
                </span>
              )}
              {rolesList &&
                rolesList.map((role: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize"
                  >
                    {role.split("_").join(" ")}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}