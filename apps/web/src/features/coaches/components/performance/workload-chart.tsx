import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3 } from "lucide-react";
import type { CoachWorkload } from "../../types/coach";

interface WorkloadChartProps {
  data: CoachWorkload[];
  isLoading: boolean;
}

export function WorkloadChart({ data, isLoading }: WorkloadChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Workload Distribution
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Client assignments across coaches
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Find the max client count for scaling
  const maxClients = Math.max(...data.map(d => d.clientCount), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Workload Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Client assignments across coaches
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((coach) => {
            const initials = coach.coachName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div key={coach.coachId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={coach.coachImage || undefined} alt={coach.coachName} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{coach.coachName}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {coach.clientCount} clients
                  </span>
                </div>
                <Progress 
                  value={(coach.clientCount / maxClients) * 100} 
                  className="h-2"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}