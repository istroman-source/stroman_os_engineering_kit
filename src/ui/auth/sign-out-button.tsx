"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/primitives/button";
import { signOut } from "./api-client";

/** Sign out and return to /login. Idempotent; always lands on /login. */
export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      await signOut();
    } catch {
      // Sign-out is best-effort; still send the user to /login.
    } finally {
      router.replace("/login");
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </Button>
  );
}
