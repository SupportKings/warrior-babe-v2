"use client";

import { createContext, useContext, useMemo } from "react";

import { parseAsIsoDateTime, useQueryState } from "nuqs";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeContextValue {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const DateRangeContext = createContext<DateRangeContextValue | undefined>(
  undefined
);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  // Use nuqs to manage date range in URL
  const [fromDate, setFromDate] = useQueryState(
    "from",
    parseAsIsoDateTime.withDefault(
      (() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
      })()
    )
  );

  const [toDate, setToDate] = useQueryState(
    "to",
    parseAsIsoDateTime.withDefault(new Date())
  );

  const dateRange = useMemo(
    () => ({
      from: fromDate,
      to: toDate,
    }),
    [fromDate, toDate]
  );

  const setDateRange = (range: DateRange) => {
    setFromDate(range.from);
    setToDate(range.to);
  };

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within DateRangeProvider");
  }
  return context;
}

export type { DateRange };
