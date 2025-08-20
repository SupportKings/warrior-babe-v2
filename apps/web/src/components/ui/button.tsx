import type * as React from "react";

import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";

const buttonVariants = cva(
  "group relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap align-top font-medium transition-all duration-150 [-webkit-box-align:center] [-webkit-box-pack:center] [app-region:no-drag] disabled:cursor-default disabled:text-[lch(62.6_1.35_272)] disabled:opacity-60",
  {
    variants: {
      variant: {
        default: [
          "text-white dark:text-white",
          "border border-[#D23B84] border-solid dark:border-[#B32E6D]",
          "shadow-[rgba(236,71,153,0.15)_0_4px_4px_-1px,rgba(236,71,153,0.2)_0_1px_1px_0]",
          "bg-[#D23B84] hover:bg-[#E0407A]",
          "dark:bg-[#B32E6D] dark:hover:bg-[#C0347A]",
        ],
        destructive: [
          "text-white dark:text-white",
          "border border-[lch(60_70_25)] border-solid dark:border-[lch(60_70_25)]",
          "shadow-[lch(0_0_0_/_0.02)_0_4px_4px_-1px,lch(0_0_0_/_0.06)_0_1px_1px_0]",
          "bg-[lch(60_70_25)] hover:bg-[lch(55_75_25)]",
          "dark:bg-[lch(60_70_25)] dark:hover:bg-[lch(55_75_25)]",
        ],
        outline: [
          "text-[lch(20.714_1_142.924)] dark:text-[lch(90.65_1.35_272)]",
          "border border-[lch(91_0_142.924)] border-solid dark:border-[lch(19_3.54_272)]",
          "shadow-[lch(0_0_0_/_0.02)_0_4px_4px_-1px,lch(0_0_0_/_0.06)_0_1px_1px_0]",
          "bg-transparent hover:bg-[lch(98_2_142.924)]",
          "dark:bg-transparent dark:hover:bg-[lch(15_5_272)]",
        ],
        secondary: [
          "text-[lch(20.714_1_142.924)] dark:text-[lch(90.65_1.35_272)]",
          "border border-[lch(91_0_142.924)] border-solid dark:border-[lch(19_3.54_272)]",
          "shadow-[lch(0_0_0_/_0.02)_0_4px_4px_-1px,lch(0_0_0_/_0.06)_0_1px_1px_0]",
          "bg-[lch(95_5_142.924)] hover:bg-[lch(92_8_142.924)]",
          "dark:bg-[lch(18_8_272)] dark:hover:bg-[lch(22_10_272)]",
        ],
        ghost: [
          "text-[lch(20.714_1_142.924)] dark:text-[lch(90.65_1.35_272)]",
          "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800",
        ],
        link: [
          "text-[lch(60_70_280)] dark:text-[lch(70_60_280)]",
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
  }
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
