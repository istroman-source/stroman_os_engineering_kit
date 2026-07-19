import type { ReactNode } from "react";
import { AppShell } from "@/ui/shell/app-shell";

// All authenticated application routes render inside the shell.
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
