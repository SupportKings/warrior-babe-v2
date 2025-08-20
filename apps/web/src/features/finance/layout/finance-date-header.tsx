"use client";

import { Tabs } from "@base-ui-components/react/tabs";
import { useDateRange } from "../components/date-range-provider";

const presets = [
  { label: "Last 30 days", days: 30, value: "30" },
  { label: "Last 60 days", days: 60, value: "60" },
  { label: "Last 90 days", days: 90, value: "90" },
];

export default function FinanceDateHeader() {
  const { dateRange, setDateRange } = useDateRange();

  const handlePresetChange = (value: string) => {
    const days = Number.parseInt(value);
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);

    setDateRange({ from, to });
  };

  // Check which preset is active
  const getActivePreset = () => {
    const now = new Date();
    const fromDate =
      dateRange.from instanceof Date
        ? dateRange.from
        : new Date(dateRange.from);
    const daysDiff = Math.round(
      (now.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const preset = presets.find((p) => Math.abs(p.days - daysDiff) <= 1);
    return preset?.value || "30"; // Default to 30 days
  };

  const activePreset = getActivePreset();

  return (
    <div className="flex h-[40px] w-full items-center border-border border-b px-4">
      <div className="flex items-center gap-3">
        <Tabs.Root value={activePreset} onValueChange={handlePresetChange}>
          <Tabs.List className="relative z-0 flex gap-1">
            {presets.map((preset) => (
              <Tabs.Tab
                key={preset.value}
                className="before:-outline-offset-1 flex h-9 select-none items-center justify-center whitespace-nowrap break-keep border-0 px-4 font-medium text-muted-foreground text-sm outline-none before:inset-x-0 before:inset-y-1 before:rounded-sm before:outline-ring hover:text-foreground focus-visible:relative focus-visible:before:absolute focus-visible:before:outline focus-visible:before:outline-2 data-[selected]:text-foreground"
                value={preset.value}
              >
                {preset.label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator className="-translate-y-1/2 absolute top-1/2 left-0 z-[-1] h-7 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] rounded-sm bg-muted transition-all duration-200 ease-in-out" />
          </Tabs.List>
        </Tabs.Root>
      </div>
    </div>
  );
}
