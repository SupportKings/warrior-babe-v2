"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCoachesCapacity } from "../queries/capacity";
import { cn } from "@/lib/utils";

export default function CoachCapacityTable() {
	const { data: coaches, isLoading } = useCoachesCapacity();

	if (isLoading) {
		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Coach</TableHead>
							<TableHead>Capacity</TableHead>
							<TableHead>Utilization</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...Array(5)].map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<Skeleton className="h-4 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-2 w-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-20" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	if (!coaches || coaches.length === 0) {
		return (
			<div className="rounded-md border p-8 text-center text-muted-foreground">
				No coaches found
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Coach</TableHead>
						<TableHead>Capacity</TableHead>
						<TableHead className="w-[200px]">Utilization</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{coaches.map((coach) => (
						<TableRow key={coach.id}>
							<TableCell>
								<div>
									<div className="font-medium">{coach.name}</div>
									<div className="text-sm text-muted-foreground">
										{coach.email}
									</div>
								</div>
							</TableCell>
							<TableCell>
								<div className="text-sm">
									<span className="font-medium">{coach.current_client_units}</span>
									<span className="text-muted-foreground"> / {coach.actual_capacity}</span>
								</div>
							</TableCell>
							<TableCell>
								<div className="space-y-1">
									<Progress 
										value={coach.utilization_percentage} 
										className={cn(
											"h-2",
											coach.is_over_capacity && "bg-red-100"
										)}
									/>
									<div className="text-xs text-muted-foreground">
										{coach.utilization_percentage}%
									</div>
								</div>
							</TableCell>
							<TableCell>
								{coach.capacity?.is_paused ? (
									<Badge variant="secondary">Paused</Badge>
								) : coach.is_over_capacity ? (
									<Badge variant="destructive">Over Capacity</Badge>
								) : coach.utilization_percentage > 75 ? (
									<Badge variant="outline" className="border-amber-500 text-amber-700">
										High Load
									</Badge>
								) : (
									<Badge variant="outline" className="border-green-500 text-green-700">
										Normal
									</Badge>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}