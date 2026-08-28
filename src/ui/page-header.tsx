import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/ui/primitives/breadcrumbs";

export interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly eyebrow?: string;
  readonly breadcrumbs?: readonly BreadcrumbItem[];
  readonly actions?: ReactNode;
}

/** Consistent context, hierarchy, and primary-action placement for every route. */
export function PageHeader({ title, description, eyebrow, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 space-y-4 sm:mb-10">
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl min-w-0">
          {eyebrow ? (
            <p className="text-primary mb-2 text-xs font-semibold tracking-[0.14em] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-foreground text-3xl leading-[1.15] font-semibold tracking-[-0.035em] sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground mt-2 max-w-2xl text-base leading-7">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
