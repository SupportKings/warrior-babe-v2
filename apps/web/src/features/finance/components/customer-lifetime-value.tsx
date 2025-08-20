"use client";

import { Card } from "@/components/ui/card";
import { LineChart } from "@/components/charts/lineChart";

// Sample data for average customer lifetime value over time
const ltvData = [
	{
		month: "Jan",
		"VIP 12-month": 1245,
		"WB360 flexible": 689,
	},
	{
		month: "Feb",
		"VIP 12-month": 1367,
		"WB360 flexible": 701,
	},
	{
		month: "Mar",
		"VIP 12-month": 1489,
		"WB360 flexible": 843,
	},
	{
		month: "Apr",
		"VIP 12-month": 1512,
		"WB360 flexible": 956,
	},
	{
		month: "May",
		"VIP 12-month": 1634,
		"WB360 flexible": 1078,
	},
	{
		month: "Jun",
		"VIP 12-month": 1756,
		"WB360 flexible": 1189,
	},
	{
		month: "Jul",
		"VIP 12-month": 1878,
		"WB360 flexible": 1301,
	},
	{
		month: "Aug",
		"VIP 12-month": 1989,
		"WB360 flexible": 1412,
	},
];

const valueFormatter = (number: number) =>
	`$${Intl.NumberFormat("us").format(number).toString()}`;

export default function CustomerLifetimeValue() {
	const currentVIPAvg = "$1,989";
	const currentWB360Avg = "$1,412";
	const overallAvg = "$1,642";
	const change = "+18.7%";

	return (
		<div className="space-y-4">
			<Card className="p-6">
				<h3 className="text-tremor-content text-tremor-default dark:text-dark-tremor-content">
					Average Customer Lifetime Value
				</h3>
				<p className="mt-1 font-semibold text-tremor-content-strong text-tremor-metric dark:text-dark-tremor-content-strong">
					{overallAvg}
				</p>
				<p className="mt-1 font-medium text-tremor-default">
					<span className="text-emerald-700 dark:text-emerald-500">
						{change}
					</span>{" "}
					<span className="font-normal text-tremor-content dark:text-dark-tremor-content">
						from last month
				</span>
				</p>
				<LineChart
					data={ltvData}
					index="month"
					categories={["VIP 12-month", "WB360 flexible"]}
					colors={["blue", "violet"]}
					valueFormatter={valueFormatter}
					yAxisWidth={48}
					showLegend={false}
					className="mt-6 h-48"
				/>
				<div className="mt-6 space-y-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<span className="h-3 w-3 shrink-0 rounded-full bg-blue-500" />
							<span className="text-tremor-content text-tremor-default dark:text-dark-tremor-content">
								VIP 12-month
							</span>
						</div>
						<span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
							{currentVIPAvg}/customer
						</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<span className="h-3 w-3 shrink-0 rounded-full bg-violet-500" />
							<span className="text-tremor-content text-tremor-default dark:text-dark-tremor-content">
								WB360 flexible
							</span>
						</div>
						<span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
							{currentWB360Avg}/customer
						</span>
					</div>
				</div>
			</Card>
		</div>
	);
}