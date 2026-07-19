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
      {/* Keyboard users can jump straight to content (WCAG 2.4.1). */}
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <TopNav />
        <main id="main-content" tabIndex={-1} className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
