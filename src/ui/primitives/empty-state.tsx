import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/ui/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  readonly icon?: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly className?: string;
}) {
  return (
    <section
      data-slot="empty-state"
      className={cn(
        "border-border bg-card flex flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="bg-accent text-accent-foreground mb-4 grid size-11 place-items-center rounded-full">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      ) : null}
      <h2 className="text-lg font-semibold tracking-[-0.015em]">{title}</h2>
      <p className="text-muted-foreground mt-1 max-w-md text-sm leading-6">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
