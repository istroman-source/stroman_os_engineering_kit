import { APP_NAME } from "@/lib/config";
import { NavLinks } from "./nav-links";

/**
 * Application sidebar. Hidden on small viewports (the top bar carries
 * navigation there). Presentation only — no business logic.
 */
export function Sidebar() {
  return (
    <aside className="border-sidebar-border bg-sidebar hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="border-sidebar-border flex h-14 items-center gap-2 border-b px-4">
        <div aria-hidden className="bg-primary text-primary-foreground size-6 rounded" />
        <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks orientation="vertical" />
      </div>
    </aside>
  );
}
