import { ClientTestimonialsAddHeader } from "@/features/client-testimonials/layout/client-testimonials.add.header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MainLayout from "@/components/layout/main-layout";

export function ClientTestimonialsAddSkeleton() {
  return (
    <MainLayout headers={[<ClientTestimonialsAddHeader />]}>
      <div className="p-6 space-y-6">
        {/* Basic Information Card */}
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />

        {/* First row of fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Second row of fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* URL field */}
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>

        {/* Content textarea */}
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <div className="h-10 w-20 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </MainLayout>
  );
}
