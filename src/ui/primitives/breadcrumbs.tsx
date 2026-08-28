import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

export function Breadcrumbs({ items }: { readonly items: readonly BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 ? <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" /> : null}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground rounded-sm underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={isCurrent ? "text-foreground truncate font-medium" : "truncate"}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
