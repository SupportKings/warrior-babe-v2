"use client";

import { LineChart } from "@/components/charts/lineChart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useDateRange } from "@/features/finance/components/date-range-provider";
import {
  activeSubscriptionsQuery,
  churnMetricsQuery,
  revenueChartQuery,
  revenueMetricsQuery,
} from "@/features/finance/queries/finance-queries";

import { useQuery } from "@tanstack/react-query";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const valueFormatter = (number: number) =>
  `$${Intl.NumberFormat("us").format(number).toString()}`;

export default function BigDaddy() {
  const { dateRange } = useDateRange();

  // Fetch revenue metrics
  const { data: revenueMetrics, isLoading: isLoadingRevenue } = useQuery(
    revenueMetricsQuery(dateRange)
  );

  // Fetch chart data
  const { data: chartData, isLoading: isLoadingChart } = useQuery(
    revenueChartQuery(dateRange)
  );

  // Fetch active subscriptions
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery(
    activeSubscriptionsQuery(dateRange)
  );

  // Fetch churn metrics
  const { data: churnMetrics, isLoading: isLoadingChurn } = useQuery(
    churnMetricsQuery(dateRange)
  );

  // Get categories from actual subscription data
  const categories = subscriptions?.byType
    ? Object.keys(subscriptions.byType)
    : ["Group A", "Group B", "Group C"];

  // Format chart data for display
  const data =
    chartData?.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      ...Object.fromEntries(
        categories.map((category) => [category, item[category] || 0])
      ),
    })) || [];

  // Calculate summary data from subscriptions
  const summary = Object.entries(subscriptions?.byType || {}).map(
    ([categoryName, data], index) => {
      // Calculate revenue for this category from chart data
      const categoryRevenue =
        chartData?.reduce((sum, day) => {
          const dayRevenue = day[categoryName];
          return sum + (typeof dayRevenue === "number" ? dayRevenue : 0);
        }, 0) || 0;

      // Dynamic colors for different categories
      const colors = [
        "bg-blue-500",
        "bg-violet-500",
        "bg-emerald-500",
        "bg-amber-500",
        "bg-red-500",
        "bg-indigo-500",
        "bg-pink-500",
      ];
      const bgColor = colors[index % colors.length];

      // Get churn rate for this category
      const churnData = churnMetrics?.[categoryName];
      const churnRate = churnData?.churnRate || 0;

      return {
        name: categoryName,
        value: valueFormatter(categoryRevenue),
        subscriptions: data.count.toString(),
        revenue: valueFormatter(categoryRevenue / 30), // Average daily revenue
        growth: revenueMetrics?.growthPercentage
          ? `${
              revenueMetrics.growthPercentage > 0 ? "+" : ""
            }${revenueMetrics.growthPercentage.toFixed(1)}%`
          : "0%",
        churn: `${churnRate.toFixed(1)}%`,
        avgRevenue: valueFormatter(categoryRevenue / data.count || 0),
        bgColor,
        changeType: (revenueMetrics?.growth || 0) > 0 ? "positive" : "negative",
      };
    }
  );

  if (
    isLoadingRevenue ||
    isLoadingChart ||
    isLoadingSubscriptions ||
    isLoadingChurn
  ) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <>
      <h3 className="text-tremor-content text-tremor-default dark:text-dark-tremor-content">
        Coaching Program Sales Performance
      </h3>
      <p className="mt-1 font-semibold text-tremor-content-strong text-tremor-metric dark:text-dark-tremor-content-strong">
        {valueFormatter(revenueMetrics?.totalRevenue || 0)}
      </p>
      <p className="mt-1 font-medium text-tremor-default">
        <span
          className={
            (revenueMetrics?.growth || 0) > 0
              ? "text-emerald-700 dark:text-emerald-500"
              : "text-red-700 dark:text-red-500"
          }
        >
          {(revenueMetrics?.growth || 0) > 0 ? "+" : ""}
          {valueFormatter(revenueMetrics?.growth || 0)} (
          {(revenueMetrics?.growthPercentage || 0).toFixed(1)}%)
        </span>{" "}
        <span className="font-normal text-tremor-content dark:text-dark-tremor-content">
          vs previous period
        </span>
      </p>
      <LineChart
        data={data}
        index="date"
        categories={categories}
        colors={
          ["blue", "violet", "emerald", "amber", "red", "pink", "gray"].slice(
            0,
            categories.length
          ) as (
            | "blue"
            | "violet"
            | "emerald"
            | "amber"
            | "red"
            | "pink"
            | "gray"
          )[]
        }
        valueFormatter={valueFormatter}
        yAxisWidth={60}
        onValueChange={() => {}}
        className="mt-6 hidden h-96 sm:block"
      />
      <LineChart
        data={data}
        index="date"
        categories={categories}
        colors={
          ["blue", "violet", "emerald", "amber", "red", "pink", "gray"].slice(
            0,
            categories.length
          ) as (
            | "blue"
            | "violet"
            | "emerald"
            | "amber"
            | "red"
            | "pink"
            | "gray"
          )[]
        }
        valueFormatter={valueFormatter}
        showYAxis={false}
        showLegend={false}
        startEndOnly={true}
        className="mt-6 h-72 sm:hidden"
      />

      <Table className="mt-8">
        <TableHeader>
          <TableRow className="border-tremor-border border-b dark:border-dark-tremor-border">
            <TableHead className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Program
            </TableHead>
            <TableHead className="text-right text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Total Revenue
            </TableHead>
            <TableHead className="text-right text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Subscriptions
            </TableHead>
            <TableHead className="text-right text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Monthly Revenue
            </TableHead>
            <TableHead className="text-right text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Growth
            </TableHead>
            <TableHead className="text-right text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Churn Rate
            </TableHead>
            <TableHead className="text-right text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Avg Revenue
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summary.map((item) => (
            <TableRow key={item.name}>
              <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                <div className="flex space-x-3">
                  <span
                    className={classNames(item.bgColor, "w-1 shrink-0 rounded")}
                    aria-hidden={true}
                  />
                  <span>{item.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{item.value}</TableCell>
              <TableCell className="text-right">{item.subscriptions}</TableCell>
              <TableCell className="text-right">{item.revenue}</TableCell>
              <TableCell className="text-right">
                <span
                  className={classNames(
                    item.changeType === "positive"
                      ? "text-emerald-700 dark:text-emerald-500"
                      : "text-red-700 dark:text-red-500"
                  )}
                >
                  {item.growth}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={classNames(
                    item.changeType === "positive"
                      ? "text-emerald-700 dark:text-emerald-500"
                      : "text-red-700 dark:text-red-500"
                  )}
                >
                  {item.churn}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={classNames(
                    item.changeType === "positive"
                      ? "text-emerald-700 dark:text-emerald-500"
                      : "text-red-700 dark:text-red-500"
                  )}
                >
                  {item.avgRevenue}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
