import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import type { CoachPerformance } from "../../types/coach";

interface TopCoachesProps {
  coaches: CoachPerformance[];
  isLoading: boolean;
}

export function TopCoaches({ coaches, isLoading }: TopCoachesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Performing Coaches
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on client satisfaction and retention
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performing Coaches
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on client satisfaction and retention
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {coaches.map((coach, index) => {
            const initials = coach.coachName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div key={coach.coachId} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                  #{index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={coach.coachImage || undefined} alt={coach.coachName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{coach.coachName}</p>
                    <span className="text-lg font-bold text-primary">
                      {coach.satisfactionPercentage}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {coach.coachType} Coach
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Satisfaction
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}