import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/design-system/primitives"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-800 dark:text-primary-100 dark:hover:bg-primary-700",
        primary:
          "bg-primary-500 text-primary-foreground hover:bg-primary-600",
        secondary:
          "bg-secondary-100 text-secondary-800 hover:bg-secondary-200 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600",
        outline:
          "border border-input bg-background hover:bg-muted hover:text-muted-foreground",
        success:
          "bg-success-100 text-success-800 hover:bg-success-200 dark:bg-success-800 dark:text-success-100 dark:hover:bg-success-700",
        accent:
          "bg-accent-100 text-accent-800 hover:bg-accent-200 dark:bg-accent-800 dark:text-accent-100 dark:hover:bg-accent-700",
        destructive:
          "bg-destructive-100 text-destructive-800 hover:bg-destructive-200 dark:bg-destructive-800 dark:text-destructive-100 dark:hover:bg-destructive-700",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-base px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
