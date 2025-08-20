import type { CoachMetrics } from "../../types/coach";
import { AvgRatingBox } from "./avg-rating";
import { TotalClientsBox } from "./total-clients";
import { TotalCoachesBox } from "./total-coaches";

interface KPIBoxesProps {
  metrics: CoachMetrics | undefined;
  isLoading: boolean;
}

export function KPIBoxes({ metrics, isLoading }: KPIBoxesProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <TotalCoachesBox
        total={metrics?.totalCoaches || 0}
        premier={metrics?.premierCoachCount || 0}
        regular={metrics?.regularCoachCount || 0}
        isLoading={isLoading}
      />
      <AvgRatingBox
        rating={metrics?.averageSatisfaction || 0}
        isLoading={isLoading}
      />
      <TotalClientsBox
        total={metrics?.totalClients || 0}
        isLoading={isLoading}
      />
    </div>
  );
}
