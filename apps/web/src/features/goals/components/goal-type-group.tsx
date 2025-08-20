import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import type { GoalType } from "../types/goalType";

import NumberFlow from "@number-flow/react";
import { GoalTypeRow } from "./goal-type-row";

interface GoalTypeGroupProps {
	category: string;
	goalTypes: GoalType[];
	canManage: boolean;
	onEdit: (goalType: GoalType) => void;
	onDelete: (goalType: GoalType) => void;
}

export function GoalTypeGroup({
	category,
	goalTypes,
	canManage,
	onEdit,
	onDelete,
}: GoalTypeGroupProps) {
	const count = goalTypes.length;

	return (
		<Collapsible className="" defaultOpen={true}>
			{/* Category Header */}
			<div className="h-9 w-full border-b-black">
				<div className="flex h-full min-w-0 items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap border-b-black py-0 pr-6 pl-0 shadow-[lch(88.679_0_282.863)_0_0.5px_0,lch(88.679_0_282.863)_0_-0.5px_0] outline-offset-[-3px] transition-[box-shadow,background-color] duration-[0.15s,0s] [background:linear-gradient(90deg,lch(96.667_0_282.863)_0,lch(96.667_0_282.863)_100%),lch(96.667_0_282.863)] dark:shadow-none dark:[background:linear-gradient(90deg,lch(9.934_1.648_271.985)_0,lch(8.3_1.867_272)_100%),lch(8.3_1.867_272)]">
					{/* Collapse Button */}
					<div className="flex flex-row">
						<CollapsibleTrigger
							className="group before:-inset-3 relative inline-flex h-6 w-6 min-w-6 shrink-0 translate-x-[3px] cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-[5px] border-0 border-transparent border-solid bg-transparent px-0.5 py-0 font-medium text-[lch(62.661_1_282.863)] text-xs transition-[border,background-color,color,opacity] duration-[0.15s] before:absolute before:content-[''] hover:bg-transparent disabled:cursor-default disabled:opacity-60 dark:text-[lch(40.559_7_271.985)] dark:hover:fill-[lch(90.994_1.933_272)]"
							aria-label="Collapse group"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
								role="img"
								fill="lch(62.661% 1 282.863 / 1)"
								viewBox="0 0 16 16"
								height="16"
								width="16"
								className="transition-all ease-out group-data-[panel-open]:rotate-90 dark:fill-[lch(40.559%_7_271.985)]"
							>
								<path d="M7.00194 10.6239C6.66861 10.8183 6.25 10.5779 6.25 10.192V5.80802C6.25 5.42212 6.66861 5.18169 7.00194 5.37613L10.7596 7.56811C11.0904 7.76105 11.0904 8.23895 10.7596 8.43189L7.00194 10.6239Z" />
							</svg>
						</CollapsibleTrigger>
					</div>

					{/* Category Name and Count */}
					<div className="flex flex-row items-center gap-2">
						<div className="flex flex-row">
							<span className="-mx-0.5 relative my-0 min-w-0 cursor-default overflow-hidden text-ellipsis whitespace-nowrap rounded px-0.5 py-0 text-left font-medium text-[13px] text-[lch(18.988_1_282.863)] no-underline dark:text-[lch(90.994_1.933_272)]">
								{category}
							</span>
						</div>
						<div className="flex shrink-0 flex-row">
							<div className="box-border inline-flex h-6 cursor-default items-center rounded border-[none] bg-transparent p-0 transition-[color,background] duration-0">
								<div className="flex flex-row items-center">
									<span className="min-w-0 overflow-visible text-ellipsis text-right font-[450] text-[13px] text-[lch(37.976_1_282.863)] dark:text-[lch(63.975_7_271.985)]">
										<span className="inline-flex w-auto overflow-visible tabular-nums">
											<NumberFlow value={count} />
											&nbsp;{count === 1 ? "type" : "types"}
										</span>
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Goal Types List */}
			<CollapsibleContent className="flex h-[var(--collapsible-panel-height)] flex-col justify-end overflow-hidden transition-all ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
				<div className="flex flex-col">
					{goalTypes.map((goalType) => (
						<GoalTypeRow
							key={goalType.id}
							goalType={goalType}
							canManage={canManage}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}