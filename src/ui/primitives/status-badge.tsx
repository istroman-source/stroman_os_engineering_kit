import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/ui/cn";

const statusBadgeVariants = cva(
  "inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs leading-4 font-semibold",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        error: "bg-destructive-soft text-destructive",
        progress: "bg-info-soft text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  readonly children: ReactNode;
  readonly className?: string;
}

export function StatusBadge({ tone, className, children }: StatusBadgeProps) {
  return (
    <span data-slot="status-badge" className={cn(statusBadgeVariants({ tone }), className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export { statusBadgeVariants };
