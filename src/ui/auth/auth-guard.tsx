"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "./api-client";

/**
 * Client-side route guard for the authenticated app shell. It checks the real
 * session endpoint (token validity, not just cookie presence) and redirects to
 * /login when signed out. This is a UX gate ONLY — every data request is still
 * authorized by the backend, so the redirect is not a security boundary.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "authed">("checking");

  useEffect(() => {
    let active = true;
    void getSession().then((authenticated) => {
      if (!active) return;
      if (authenticated) setState("authed");
      else router.replace("/login");
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (state !== "authed") {
    return <p className="text-muted-foreground p-6 text-sm">Checking session…</p>;
  }
  return <>{children}</>;
}
