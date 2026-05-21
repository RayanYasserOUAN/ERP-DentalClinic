import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
        primary: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
        success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
        warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
        destructive: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
        info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        outline: "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
