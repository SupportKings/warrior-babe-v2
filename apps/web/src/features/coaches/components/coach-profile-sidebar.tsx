"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { IconDisplay } from "@/features/icons";

import { useQueryClient } from "@tanstack/react-query";
import { Edit, MoreVertical, ShieldCheck, Star, Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { removeCertification } from "../actions/removeCertification";
import { removeSpecialization } from "../actions/removeSpecialization";
import { useUserCertifications } from "../queries/certifications";
import { useUserSpecializations } from "../queries/specializations";
import type { CoachProfile } from "../types/coach-profile";
import AddCertificationDialog from "./add-certification-dialog";
import AddSpecializationDialog from "./add-specialization-dialog";
import CalendarLink from "./calendarLink";
import CoachBioEditor from "./coach-bio-editor";
import EditCertificationDialog from "./edit-certification-dialog";
import EditSpecializationDialog from "./edit-specialization-dialog";

interface CoachProfileSidebarProps {
  coach: CoachProfile;
  isLoading?: boolean;
}

export default function CoachProfileSidebar({
  coach,
  isLoading,
}: CoachProfileSidebarProps) {
  const [editingCertification, setEditingCertification] = useState<any>(null);
  const [editingSpecialization, setEditingSpecialization] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch real certifications from database
  const { data: certifications, isLoading: certificationsLoading } =
    useUserCertifications(coach.id);

  // Fetch specializations
  const { data: specializations, isLoading: specializationsLoading } =
    useUserSpecializations(coach.id);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="h-full space-y-6">
      {/* Profile Section */}
      <div className="flex flex-col gap-2 border-b p-6">
        <div className="flex flex-col gap-2.5">
          {/* Name and Basic Info */}
          <div className="flex w-full flex-row gap-6">
            <div className="flex min-w-0 grow flex-col gap-3">
              <div className="flex min-w-0 flex-row items-center justify-between gap-1">
                <div className="flex min-w-0 grow flex-row items-center">
                  <div className="flex min-w-0 flex-row items-center gap-2.5">
                    <Avatar className="h-11 w-11">
                      <AvatarImage
                        src={coach.image || undefined}
                        alt={coach.name}
                      />
                      <AvatarFallback className="text-lg">
                        {getInitials(coach.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-lg">{coach.name}</span>
                      <div className="flex flex-row items-baseline gap-1.5">
                        <span className="font-[450] text-[13px] text-muted-foreground">
                          {coach.email}
                        </span>
                        <div className="flex flex-row gap-1">
                          <span className="font-[450] text-[13px] text-muted-foreground">
                            ⋅
                          </span>
                          <div className="flex flex-row items-baseline gap-1">
                            <Badge
                              variant={
                                coach.isPremier ? "default" : "secondary"
                              }
                              className="h-auto px-1.5 py-0 text-[11px]"
                            >
                              {coach.isPremier ? "Premier" : "Regular"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Structured Info Fields */}
          <div className="mt-2 flex flex-col gap-2">
            {/* Calendar Link Row */}

            {/* Bio Row */}
            <div className="flex flex-row items-start gap-2">
              <div className="flex w-[90px] shrink-0 flex-row items-center">
                <span className="text-left font-[450] text-muted-foreground text-xs">
                  Bio
                </span>
              </div>
              <div className="flex min-w-0 flex-initial flex-col">
                <CoachBioEditor
                  userId={coach.id}
                  initialBio={coach.bio}
                  isEditable={true}
                />
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="flex w-[90px] shrink-0 flex-row items-center">
                <span className="text-left font-[450] text-muted-foreground text-xs">
                  Calendar
                </span>
              </div>
              <div className="flex min-w-0 flex-initial flex-col">
                <CalendarLink
                  calendarUrl={coach.calendar_link}
                  userId={coach.id}
                  isEditable={true}
                />
              </div>
            </div>

            {/* Reports To Row (if applicable) */}
            {!coach.isPremier && coach.premier_coach && (
              <div className="flex flex-row items-center gap-2">
                <div className="flex w-[90px] shrink-0 flex-row items-center">
                  <span className="text-left font-[450] text-muted-foreground text-xs">
                    Reports to
                  </span>
                </div>
                <div className="flex min-w-0 flex-initial flex-col">
                  <div className="flex min-h-7 flex-row items-center px-1.5 py-[3px]">
                    <Link
                      href={`/dashboard/coaches/${coach.premier_coach.id}`}
                      className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={coach.premier_coach.image || undefined}
                        />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(coach.premier_coach.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-[13px]">
                        {coach.premier_coach.name}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-6 ">
        {/* Certifications */}
        <div className="border-b px-6 pb-6">
          <div className="mb-4 flex flex-row items-center justify-between">
            <h3 className="font-semibold text-base">Certifications</h3>
            <AddCertificationDialog userId={coach.id} />
          </div>
          {certificationsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : certifications && certifications.length > 0 ? (
            <div className="space-y-2">
              {certifications.map((userCert) => (
                <div
                  key={userCert.id}
                  className="rounded-lg border border-border bg-muted/50 p-3"
                >
                  <div className="flex items-start gap-3">
                    {userCert.certification.icon && (
                      <div className="flex-shrink-0">
                        <Image
                          width={48}
                          height={48}
                          src={userCert.certification.icon}
                          alt={`${userCert.certification.name} icon`}
                          className="h-12 w-12 rounded-md object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {userCert.certification.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {userCert.certification.issuer}
                          </p>
                          <p className="mt-1 text-muted-foreground text-xs">
                            Achieved:{" "}
                            {new Date(
                              userCert.date_achieved
                            ).toLocaleDateString()}
                          </p>
                          {userCert.expiry_date && (
                            <p className="text-muted-foreground text-xs">
                              Expires:{" "}
                              {new Date(
                                userCert.expiry_date
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <AnimatePresence initial={false}>
                            {userCert.verified && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                              >
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <ShieldCheck className="h-4 w-4 text-green-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Verified certification</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingCertification(userCert);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit certification
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  const result = await removeCertification({
                                    userCertificationId: userCert.id,
                                  });

                                  if (result?.data?.success) {
                                    toast.success(
                                      "Certification removed successfully"
                                    );
                                    queryClient.invalidateQueries({
                                      queryKey: [
                                        "certifications",
                                        "user",
                                        coach.id,
                                      ],
                                    });
                                    queryClient.invalidateQueries({
                                      queryKey: ["coaches", "detail", coach.id],
                                    });
                                  } else {
                                    toast.error(
                                      "Failed to remove certification"
                                    );
                                  }
                                }}
                                className=""
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Remove certification
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              No certifications added yet
            </p>
          )}
        </div>

        {/* Specializations */}
        <div className="px-6 pb-6">
          <div className="mb-4 flex flex-row items-center justify-between">
            <h3 className="font-semibold text-base">Specializations</h3>
            <AddSpecializationDialog userId={coach.id} />
          </div>
          {specializationsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : specializations && specializations.length > 0 ? (
            <div className="space-y-2">
              {specializations.map((userSpec) => (
                <div
                  key={userSpec.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 p-2"
                >
                  <div className="flex items-center gap-2">
                    {userSpec.is_primary && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Primary specialization</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded bg-muted">
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <IconDisplay
                          iconKey={userSpec.specialization.icon || undefined}
                          className="h-4 w-4"
                          fallback={
                            <span className="font-semibold text-xs">
                              {userSpec.specialization.name
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          }
                        />
                      </div>
                    </div>
                    <span className="font-medium text-sm">
                      {userSpec.specialization.name}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingSpecialization(userSpec);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit specialization
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          const result = await removeSpecialization({
                            userSpecializationId: userSpec.id,
                          });

                          if (result?.data?.success) {
                            toast.success(
                              "Specialization removed successfully"
                            );
                            queryClient.invalidateQueries({
                              queryKey: ["specializations", "user", coach.id],
                            });
                            queryClient.invalidateQueries({
                              queryKey: ["coaches", "detail", coach.id],
                            });
                          } else {
                            toast.error("Failed to remove specialization");
                          }
                        }}
                        className=""
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Remove specialization
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              No specializations added yet
            </p>
          )}
        </div>

        {editingCertification && (
          <EditCertificationDialog
            userCertification={editingCertification}
            open={!!editingCertification}
            onOpenChange={(open) => {
              if (!open) setEditingCertification(null);
            }}
          />
        )}

        {editingSpecialization && (
          <EditSpecializationDialog
            userSpecialization={editingSpecialization}
            open={!!editingSpecialization}
            onOpenChange={(open) => {
              if (!open) setEditingSpecialization(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
