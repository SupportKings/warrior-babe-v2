import type * as React from "react";

import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";

const buttonVariants = cva(
	"group relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap align-top font-medium transition-all duration-150 [-webkit-box-align:center] [-webkit-box-pack:center] [app-region:no-drag] disabled:cursor-default disabled:text-muted-foreground disabled:opacity-60",
	{
		variants: {
			variant: {
				default: [
					"text-primary-foreground",
					"border border-primary border-solid",
					"bg-primary hover:bg-primary/90",
					"shadow-xs"
				],
				destructive: [
					"text-white",
					"border border-destructive border-solid",
					"bg-destructive hover:bg-destructive/90",
					"shadow-xs"
				],
				outline: [
					"text-foreground",
					"border border-border border-solid",
					"bg-transparent hover:bg-accent hover:text-accent-foreground",
					"shadow-xs"
				],
				secondary: [
					"text-secondary-foreground",
					"border border-border border-solid",
					"bg-secondary hover:bg-secondary/80",
					"shadow-xs"
				],
				ghost: [
					"text-foreground",
					"bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800",
				],
				link: [
					"text-primary",
					"bg-transparent hover:underline",
				],
			},
			size: {
				default:
					"m-0 h-7 min-w-7 cursor-default rounded-[5px] px-3.5 py-0 text-xs",
				sm: "m-0 h-6 min-w-6 cursor-default rounded-[5px] px-3 py-0 text-xs",
				lg: "m-0 h-8 min-w-8 cursor-default rounded-[5px] px-4 py-0 text-sm",
				icon: "m-0 h-7 min-w-7 cursor-default rounded-[5px] p-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? SlotPrimitive.Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
