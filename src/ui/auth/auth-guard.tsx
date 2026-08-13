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
  const [state, setState] = useState<"checking" | "authed" | "denied" | "unavailable">("checking");

  useEffect(() => {
    let active = true;
    void getSession().then((session) => {
      if (!active) return;
      if (session.state === "AUTHORIZED") setState("authed");
      else if (session.state === "PRIVATE_BETA_DENIED") setState("denied");
      else if (session.state === "UNAVAILABLE") setState("unavailable");
      else router.replace("/login");
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (state !== "authed") {
    if (state === "denied") {
      return (
        <main className="flex min-h-svh items-center justify-center px-6 py-16">
          <section className="border-border bg-card w-full max-w-lg rounded-xl border p-8 shadow-2xl">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
              Private testing
            </p>
            <h1 className="mt-3 text-2xl font-semibold">
              Stroman OS is currently in private testing.
            </h1>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              This account does not have access yet.
            </p>
          </section>
        </main>
      );
    }
    if (state === "unavailable") {
      return (
        <main className="flex min-h-svh items-center justify-center px-6 py-16">
          <section className="border-border bg-card w-full max-w-lg rounded-xl border p-8 shadow-2xl">
            <h1 className="text-2xl font-semibold">Stroman OS is temporarily unavailable.</h1>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              We could not verify your session or private access. Please try again shortly.
            </p>
          </section>
        </main>
      );
    }
    return <p className="text-muted-foreground p-6 text-sm">Checking session…</p>;
  }
  return <>{children}</>;
}
