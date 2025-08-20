import { TopCoaches } from "./top-coaches";
import { WorkloadChart } from "./workload-chart";
import type { CoachPerformance, CoachWorkload } from "../../types/coach";

interface PerformanceSectionProps {
  topPerformers: CoachPerformance[] | undefined;
  workload: CoachWorkload[] | undefined;
  isLoading: boolean;
}

export function PerformanceSection({ 
  topPerformers, 
  workload, 
  isLoading 
}: PerformanceSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TopCoaches 
        coaches={topPerformers || []} 
        isLoading={isLoading} 
      />
      <WorkloadChart 
        data={workload || []} 
        isLoading={isLoading} 
      />
    </div>
  );
}