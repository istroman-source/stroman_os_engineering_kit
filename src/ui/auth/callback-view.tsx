"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeCallback, friendlyError } from "./api-client";
import { safeInternalPath } from "./redirect-safety";

/**
 * Magic-link landing page. The provider redirects here with the session in the URL
 * FRAGMENT (implicit flow). We read it client-side (unavoidable for this flow),
 * immediately hand it to the server to establish HttpOnly cookies, then scrub the
 * fragment from the address bar and redirect to a validated internal path. Tokens
 * live in memory only for the single POST — never in storage.
 */
export function CallbackView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      // Yield first so no state is set synchronously within the effect body.
      await Promise.resolve();
      if (!active) return;

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const target = safeInternalPath(new URLSearchParams(window.location.search).get("next"));

      if (hash.get("error") || hash.get("error_description")) {
        setError("That sign-in link is invalid or has expired. Please request a new one.");
        return;
      }
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (!accessToken || !refreshToken) {
        setError("This sign-in link is missing its session. Please request a new one.");
        return;
      }
      const expiresRaw = hash.get("expires_in");
      const expiresInSeconds =
        expiresRaw && Number.isFinite(Number(expiresRaw)) ? Number(expiresRaw) : undefined;

      try {
        await completeCallback({ accessToken, refreshToken, expiresInSeconds });
        if (!active) return;
        // Remove tokens from the address bar the moment the session is established.
        window.history.replaceState(null, "", window.location.pathname);
        router.replace(target);
      } catch (err) {
        if (active) setError(friendlyError(err));
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
        <a className="text-primary text-sm underline-offset-4 hover:underline" href="/login">
          Back to sign in
        </a>
      </div>
    );
  }
  return <p className="text-muted-foreground text-sm">Completing sign-in…</p>;
}
