"use client";

import BigDaddy from "@/features/finance/components/bigdaddy";
import FinanceKPICards from "@/features/finance/components/kpicards/finance-kpi-cards";

export default function FinanceClient() {
  return (
    <div className="space-y-6 p-6">
      <FinanceKPICards />
      <div className="grid gap-6 lg:grid-cols-1">
        <div className="rounded-lg border bg-card p-6">
          <BigDaddy />
        </div>
        {/*         <CustomerLifetimeValue />
         */}{" "}
      </div>
    </div>
  );
}
