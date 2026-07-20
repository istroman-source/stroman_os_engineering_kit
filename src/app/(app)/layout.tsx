import type { ReactNode } from "react";
import { AuthGuard } from "@/ui/auth/auth-guard";
import { AppShell } from "@/ui/shell/app-shell";

// All authenticated application routes render inside the shell, behind the client
// auth guard (backend authorization remains authoritative on every request).
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
