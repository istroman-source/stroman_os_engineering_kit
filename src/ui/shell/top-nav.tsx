import { APP_NAME } from "@/lib/config";
import { NavLinks } from "./nav-links";

/**
 * Top navigation bar. On small viewports it also carries the primary nav links
 * (the sidebar is hidden there). Presentation only.
 */
export function TopNav() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 flex h-14 items-center gap-4 border-b px-4 backdrop-blur">
      <span className="text-sm font-semibold tracking-tight md:hidden">{APP_NAME}</span>
      <NavLinks orientation="horizontal" className="md:hidden" />
      <div className="ml-auto" />
    </header>
  );
}
