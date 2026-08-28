"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/ui/cn";
import { navItems, secondaryNavItems } from "./nav-config";

/**
 * Renders the primary nav links with active-state highlighting. Shared by the
 * sidebar (vertical) and the mobile top bar (horizontal).
 */
export function NavLinks({
  kind = "primary",
  orientation = "vertical",
  ariaLabel = "Primary",
  className,
}: {
  kind?: "primary" | "secondary";
  orientation?: "vertical" | "horizontal";
  ariaLabel?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const items = kind === "primary" ? navItems : secondaryNavItems;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex gap-1", orientation === "vertical" ? "flex-col" : "flex-row", className)}
    >
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-[var(--duration-base)]",
              orientation === "horizontal" && "flex-1 justify-center",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elevation-1"
                : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
