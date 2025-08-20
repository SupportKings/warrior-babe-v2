"use client";

import MainLayout from "@/components/layout/main-layout";

import { DateRangeProvider } from "@/features/finance/components/date-range-provider";
import FinanceDateHeader from "@/features/finance/layout/finance-date-header";
import FinanceHeader from "@/features/finance/layout/finance-header";

import FinanceClient from "./finance-client";

export default function FinanceWrapper() {
  return (
    <DateRangeProvider>
      <MainLayout
        headers={[
          <FinanceHeader key="finance-header" />,
          <FinanceDateHeader key="finance-date-header" />,
        ]}
      >
        <FinanceClient />
      </MainLayout>
    </DateRangeProvider>
  );
}
