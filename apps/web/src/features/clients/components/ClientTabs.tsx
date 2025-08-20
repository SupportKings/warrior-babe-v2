"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Tabs } from "@base-ui-components/react/tabs";
import {
  LayoutDashboard,
  Heart,
  CreditCard,
  Zap,
  Trophy,
  BarChart3,
  Quote,
  Target,
} from "lucide-react";

import { ActivityLog } from "@/features/tickets/components/activity-log";
import type { ActivityItem } from "@/features/shared/types/activity";

interface ClientTabsProps {
  className?: string;
}

export function ClientTabs({ className }: ClientTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock activity data for demonstration
  const mockActivityData: ActivityItem[] = [
    {
      id: "1",
      type: "activity",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      data: {
        id: "1",
        action: "UPDATE",
        table_name: "clients",
        record_id: "client-123",
        changed_by: "user-1",
        changed_by_user: {
          id: "user-1",
          name: "Sarah Coach",
          email: "sarah@example.com",
          image: null,
        },
        old_values: { status: "paused" },
        new_values: { status: "active" },
        changed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        change_type: null,
        client_id: null,
      },
    },
    {
      id: "2",
      type: "comment",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      data: {
        id: "2",
        comment: "Client completed their initial assessment and is ready to start the program.",
        user: {
          id: "user-2",
          name: "Mike CSC",
          email: "mike@example.com",
          image: null,
        },
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        coach_id: "coach-123",
        user_id: "user-2",
        is_internal: false,
      },
    },
    {
      id: "3",
      type: "activity",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      data: {
        id: "3",
        action: "UPDATE",
        table_name: "clients",
        record_id: "client-123",
        changed_by: "user-1",
        changed_by_user: {
          id: "user-1",
          name: "Sarah Coach",
          email: "sarah@example.com",
          image: null,
        },
        old_values: { assigned_to: null },
        new_values: { assigned_to: "user-1" },
        changed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        change_type: null,
        client_id: null,
      },
    },
  ];

  return (
    <div className={cn("flex-1", className)}>
      <Tabs.Root
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="w-full"
      >
        {/* Tab List */}
        <div className="mb-6">
          <div className="w-full rounded-lg border border-border bg-muted/50 p-1 shadow-sm">
            <Tabs.List className="relative z-0 grid grid-cols-2 gap-1 sm:grid-cols-4">
              <Tabs.Tab
                value="overview"
                className="flex h-8 flex-1 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 px-2 py-1 font-medium text-muted-foreground text-xs outline-none transition-all duration-150 hover:bg-background/50 hover:text-foreground data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Overview
              </Tabs.Tab>
              <Tabs.Tab
                value="goals"
                className="flex h-8 flex-1 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 px-2 py-1 font-medium text-muted-foreground text-xs outline-none transition-all duration-150 hover:bg-background/50 hover:text-foreground data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm"
              >
                <Target className="h-3.5 w-3.5" />
                Goals
              </Tabs.Tab>
              <Tabs.Tab
                value="medical"
                className="flex h-8 flex-1 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 px-2 py-1 font-medium text-muted-foreground text-xs outline-none transition-all duration-150 hover:bg-background/50 hover:text-foreground data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm"
              >
                <Heart className="h-3.5 w-3.5" />
                Medical
              </Tabs.Tab>
              <Tabs.Tab
                value="payment"
                className="flex h-8 flex-1 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 px-2 py-1 font-medium text-muted-foreground text-xs outline-none transition-all duration-150 hover:bg-background/50 hover:text-foreground data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Payment
              </Tabs.Tab>
              <Tabs.Tab
                value="activation"
                className="flex h-8 flex-1 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 px-2 py-1 font-medium text-muted-foreground text-xs outline-none transition-all duration-150 hover:bg-background/50 hover:text-foreground data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm"
              >
                <Zap className="h-3.5 w-3.5" />
                Activation
              </Tabs.Tab>
              <Tabs.Tab
                value="wins"
                className="flex h-8 flex-1 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 px-2 py-1 font-medium text-muted-foreground text-xs outline-none transition-all duration-150 hover:bg-background/50 hover:text-foreground data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm"
              >
                <Trophy className="h-3.5 w-3.5" />
                Wins
              </Tabs.Tab>
              <Tabs.Tab
                value="nps"
                className="flex h-8 flex-1 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 px-2 py-1 font-medium text-muted-foreground text-xs outline-none transition-all duration-150 hover:bg-background/50 hover:text-foreground data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                NPS
              </Tabs.Tab>
              <Tabs.Tab
                value="testimonials"
                className="flex h-8 flex-1 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border-0 px-2 py-1 font-medium text-muted-foreground text-xs outline-none transition-all duration-150 hover:bg-background/50 hover:text-foreground data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm"
              >
                <Quote className="h-3.5 w-3.5" />
                Testimonials
              </Tabs.Tab>
            </Tabs.List>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          <Tabs.Panel value="overview">
            <div className="space-y-6">
              {/* Goals & Objectives */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-lg">Goals & Objectives</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-pink-500" />
                            <div>
                              <h4 className="font-medium">Weight Loss</h4>
                              <p className="mt-1 text-muted-foreground text-sm">
                                Target: 20 lbs in 6 months
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                            <div>
                              <h4 className="font-medium">Muscle Building</h4>
                              <p className="mt-1 text-muted-foreground text-sm">
                                Focus on strength training
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                            <div>
                              <h4 className="font-medium">Nutrition</h4>
                              <p className="mt-1 text-muted-foreground text-sm">
                                Improve eating habits
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500" />
                            <div>
                              <h4 className="font-medium">Consistency</h4>
                              <p className="mt-1 text-muted-foreground text-sm">
                                Maintain regular routine
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-lg">Recent Activity</h3>
                </CardHeader>
                <CardContent>
                  <ActivityLog items={mockActivityData} entityType="coach" />
                </CardContent>
              </Card>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="goals">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-lg">Client Goals</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-pink-500" />
                            <div>
                              <h4 className="font-medium">Weight Loss</h4>
                              <p className="mt-1 text-muted-foreground text-sm">
                                Target: 20 lbs in 6 months
                              </p>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>8 lbs / 20 lbs</span>
                                </div>
                                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                                  <div className="h-full w-[40%] rounded-full bg-pink-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                            <div>
                              <h4 className="font-medium">Muscle Building</h4>
                              <p className="mt-1 text-muted-foreground text-sm">
                                Focus on strength training
                              </p>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>60%</span>
                                </div>
                                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                                  <div className="h-full w-[60%] rounded-full bg-blue-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                            <div>
                              <h4 className="font-medium">Nutrition</h4>
                              <p className="mt-1 text-muted-foreground text-sm">
                                Improve eating habits
                              </p>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>75%</span>
                                </div>
                                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                                  <div className="h-full w-[75%] rounded-full bg-green-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500" />
                            <div>
                              <h4 className="font-medium">Consistency</h4>
                              <p className="mt-1 text-muted-foreground text-sm">
                                Maintain regular routine
                              </p>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>90%</span>
                                </div>
                                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                                  <div className="h-full w-[90%] rounded-full bg-yellow-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="medical">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Medical Information</h3>
              </CardHeader>
              <CardContent>
                <p >
                  Medical information will be displayed here.
                </p>
              </CardContent>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="payment">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Payment Information</h3>
              </CardHeader>
              <CardContent>
                <p >
                  Payment information will be displayed here.
                </p>
              </CardContent>
            </Card>
          </Tabs.Panel>


          <Tabs.Panel value="activation">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Activation</h3>
              </CardHeader>
              <CardContent>
                <p >
                  Activation information will be displayed here.
                </p>
              </CardContent>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="wins">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Wins</h3>
              </CardHeader>
              <CardContent>
                <p >
                  Client wins will be displayed here.
                </p>
              </CardContent>
            </Card>
          </Tabs.Panel>


          <Tabs.Panel value="nps">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">NPS</h3>
              </CardHeader>
              <CardContent>
                <p >NPS scores will be displayed here.</p>
              </CardContent>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="testimonials">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-lg">Testimonials</h3>
              </CardHeader>
              <CardContent>
                <p >
                  Client testimonials will be displayed here.
                </p>
              </CardContent>
            </Card>
          </Tabs.Panel>

        </div>
      </Tabs.Root>
    </div>
  );
}
