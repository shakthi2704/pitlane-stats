import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
        secondary:   "border-transparent bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
        destructive: "border-transparent bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]",
        outline:     "text-[var(--color-foreground)]",
        f1:          "border-transparent bg-[var(--color-f1-red)] text-white",
        ghost:       "border-white/10 bg-white/5 text-[var(--color-muted-foreground)]",
        success:     "border-green-500/30 bg-green-500/20 text-green-400",
        warning:     "border-yellow-500/30 bg-yellow-500/20 text-yellow-400",
        link:        "border-transparent bg-transparent text-[var(--color-primary)] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }