"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

/**
 * Application shell: sidebar + top navigation + content region, responsive down
 * to 375px. Pure layout — feature routes render inside `children`.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const guidedBrief = /^\/projects\/[^/]+\/brief\/?$/.test(pathname);

  if (guidedBrief) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto min-h-svh w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10"
      >
        {children}
      </main>
    );
  }

  return (
    <div className="grid min-h-svh grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)]">
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
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[96rem] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
