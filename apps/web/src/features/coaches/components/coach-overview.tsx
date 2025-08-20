"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Clock, Star } from "lucide-react";
import type {
  CoachPerformanceData,
  CoachProfile,
} from "../types/coach-profile";
import { CapacitySettingsDialog } from "./dialogs/capacity-settings-dialog";
import ClientUnits from "./kpi-boxes/clientUnits";
import { TeamMembersTable } from "./team-members-table";

interface CoachOverviewProps {
  coach: CoachProfile;
  performanceData?: CoachPerformanceData[];
}

export default function CoachOverview({
  coach,
  performanceData,
}: CoachOverviewProps) {
  // Calculate current units and capacity
  const currentUnits = coach.totalUnits || 0;
  const globalDefault = coach.globalDefaultClientUnits || 20;
  const maxCapacity = coach.coach_capacity?.max_client_units || globalDefault;

  return (
    <div className="space-y-6">
      {/* Key Metrics - 1 column on mobile, 2x2 on tablets/13-inch laptops (accounting for 256px sidebar), 4 columns on larger screens */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">NPS Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{coach.npsScore ?? 0}</div>
            <p className="text-muted-foreground text-xs">Net Promoter Score</p>
          </CardContent>
        </Card>

        <CapacitySettingsDialog
          coachId={coach.id}
          coachName={coach.name}
          currentCapacity={maxCapacity}
          globalDefault={globalDefault}
          trigger={
            <ClientUnits
              currentUnits={currentUnits}
              maxCapacity={maxCapacity}
            />
          }
          onSuccess={() => {
            // TODO: Invalidate queries to refresh data
            console.log("Capacity updated successfully");
          }}
        />

        {/*   <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{coach.success_rate || 0}%</div>
            <p className="text-muted-foreground text-xs">
              Based on client outcomes
            </p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Avg. Client Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {coach.average_client_duration || 0}d
            </div>
            <p className="text-muted-foreground text-xs">
              Average coaching relationship
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="rating"
                  strokeWidth={2}
                  stroke="var(--color-rating)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="clients"
                  strokeWidth={2}
                  stroke="var(--color-clients)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card> */}

      {/* Recent Activity */}
      {/*      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="rounded-full bg-muted p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm leading-none">
                      {activity.action}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card> */}

      {/* Team Members (for Premier Coaches) */}
      {coach.isPremier && <TeamMembersTable coachId={coach.id} />}
    </div>
  );
}
