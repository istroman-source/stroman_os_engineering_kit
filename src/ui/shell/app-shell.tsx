import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

/**
 * Application shell: sidebar + top navigation + content region, responsive down
 * to 375px. Pure layout — feature routes render inside `children`.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh grid-cols-1 md:grid-cols-[16rem_1fr]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <TopNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
