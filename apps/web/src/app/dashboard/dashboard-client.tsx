"use client";

import DashboardLayout from "@/features/dashboard/components/dashboard-layout";
import DashboardContentCard from "@/features/dashboard/components/dashboard-content-card";
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react";

interface User {
  name: string;
  [key: string]: any;
}

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const kpiCards = [
    {
      title: "KPI Card 1",
      value: "156",
      subtitle: "Sample metric",
      icon: <Users size={20} />,
    },
    {
      title: "KPI Card 2",
      value: "$45,230",
      subtitle: "Sample value",
      icon: <DollarSign size={20} />,
    },
    {
      title: "KPI Card 3",
      value: "12",
      subtitle: "Sample data",
      icon: <TrendingUp size={20} />,
    },
    {
      title: "KPI Card 4",
      value: "5",
      subtitle: "Sample count",
      icon: <Clock size={20} />,
    },
  ];

  return (
    <DashboardLayout welcomeName={user.name} kpiCards={kpiCards}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardContentCard
          title="Content Card 1"
          subtitle="Sample content area"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">156</div>
                <div className="text-sm text-muted-foreground">Sample Metric A</div>
              </div>
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-secondary-foreground">12</div>
                <div className="text-sm text-muted-foreground">Sample Metric B</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sample Progress 1</span>
                  <span className="text-foreground">94%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "94%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sample Progress 2</span>
                  <span className="text-foreground">89%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "89%" }} />
                </div>
              </div>
            </div>
          </div>
        </DashboardContentCard>

        <DashboardContentCard
          title="Content Card 2"
          subtitle="Sample data display"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="text-foreground font-medium">Sample Item 1</div>
                <div className="text-muted-foreground text-sm">Sample description</div>
              </div>
              <div className="text-right">
                <div className="text-foreground">Sample value</div>
                <div className="text-primary text-sm bg-primary/20 px-2 py-1 rounded text-xs">Status</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="text-foreground font-medium">Sample Item 2</div>
                <div className="text-muted-foreground text-sm">Sample description</div>
              </div>
              <div className="text-right">
                <div className="text-foreground">Sample value</div>
                <div className="text-secondary-foreground text-sm">Status</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="text-foreground font-medium">Sample Item 3</div>
                <div className="text-muted-foreground text-sm">Sample description</div>
              </div>
              <div className="text-right">
                <div className="text-foreground">Sample value</div>
                <div className="text-secondary-foreground text-sm">Status</div>
              </div>
            </div>
          </div>
        </DashboardContentCard>
      </div>
    </DashboardLayout>
  );
}
