import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { SignOutButton } from "@/ui/auth/sign-out-button";
import { NavLinks } from "./nav-links";

/**
 * Application sidebar. Hidden on small viewports (the top bar carries
 * navigation there). Presentation only — no business logic.
 */
export function Sidebar() {
  return (
    <aside className="border-sidebar-border bg-sidebar sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r md:flex">
      <div className="px-5 pt-5 pb-3">
        <Link
          href="/projects"
          aria-label={`${APP_NAME} projects`}
          className="text-sidebar-foreground inline-flex min-h-11 items-center gap-3 rounded-lg pr-3"
        >
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground shadow-elevation-1 grid size-9 place-items-center rounded-xl text-sm font-bold"
          >
            S
          </span>
          <span className="text-base font-semibold tracking-[-0.025em]">{APP_NAME}</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="text-muted-foreground px-3 pb-2 text-[0.68rem] font-semibold tracking-[0.14em] uppercase">
          Workspace
        </p>
        <NavLinks orientation="vertical" />
      </div>
      <div className="border-sidebar-border space-y-1 border-t p-3">
        <NavLinks kind="secondary" ariaLabel="Account" orientation="vertical" />
        <SignOutButton />
      </div>
    </aside>
  );
}
