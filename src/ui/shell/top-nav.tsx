import Link from "next/link";
import { Settings } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { SignOutButton } from "@/ui/auth/sign-out-button";
import { NavLinks } from "./nav-links";

/**
 * Top navigation bar. On small viewports it also carries the primary nav links
 * (the sidebar is hidden there). Presentation plus the sign-out control.
 */
export function TopNav() {
  return (
    <header className="border-border bg-background/94 shadow-elevation-1 sticky top-0 z-20 border-b px-4 pt-2 pb-2 backdrop-blur md:hidden">
      <div className="flex min-h-11 items-center gap-2">
        <Link
          href="/projects"
          aria-label={`${APP_NAME} projects`}
          className="text-foreground mr-auto inline-flex min-h-11 items-center gap-2 rounded-lg pr-2"
        >
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg text-xs font-bold"
          >
            S
          </span>
          <span className="text-sm font-semibold tracking-[-0.02em]">{APP_NAME}</span>
        </Link>
        <Link
          href="/settings"
          aria-label="Settings"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground grid size-11 place-items-center rounded-lg transition-colors"
        >
          <Settings aria-hidden="true" className="size-4" />
        </Link>
        <SignOutButton />
      </div>
      <NavLinks orientation="horizontal" className="mt-1 w-full" />
    </header>
  );
}
