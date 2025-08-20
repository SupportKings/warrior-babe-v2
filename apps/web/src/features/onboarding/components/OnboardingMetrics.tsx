"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboardingMetrics } from "../hooks/useOnboardingMetrics";
import { motion } from "framer-motion";
import { UsersIcon, CheckCircleIcon, TrendingUpIcon, ClockIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const CountUp = ({ end }: { end: number }) => {
	const [count, setCount] = useState(0);
	
	useEffect(() => {
		const duration = 1000;
		const steps = 50;
		const increment = end / steps;
		const stepDuration = duration / steps;
		
		let current = 0;
		const timer = setInterval(() => {
			current += increment;
			if (current >= end) {
				setCount(end);
				clearInterval(timer);
			} else {
				setCount(Math.floor(current));
			}
		}, stepDuration);
		
		return () => clearInterval(timer);
	}, [end]);
	
	return <span>{count}</span>;
};

export function OnboardingMetrics() {
	const { data: metrics, isLoading } = useOnboardingMetrics();

	const cards = [
		{
			title: "Active Onboardings",
			value: metrics?.activeOnboardings ?? 0,
			icon: UsersIcon,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
		},
		{
			title: "Completed This Week",
			value: metrics?.completedThisWeek ?? 0,
			icon: CheckCircleIcon,
			color: "text-green-600",
			bgColor: "bg-green-50",
		},
		{
			title: "Average Progress",
			value: metrics?.averageProgress ?? 0,
			suffix: "%",
			icon: TrendingUpIcon,
			color: "text-purple-600",
			bgColor: "bg-purple-50",
		},
		{
			title: "Pending Start",
			value: metrics?.pendingStart ?? 0,
			icon: ClockIcon,
			color: "text-orange-600",
			bgColor: "bg-orange-50",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{cards.map((card, index) => (
				<motion.div
					key={card.title}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: index * 0.1 }}
				>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								{card.title}
							</CardTitle>
							<div className={`p-2 rounded-lg ${card.bgColor}`}>
								<card.icon className={`h-4 w-4 ${card.color}`} />
							</div>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<Skeleton className="h-8 w-20" />
							) : (
								<div className="text-2xl font-bold">
									<CountUp end={card.value} />
									{card.suffix}
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	);
}