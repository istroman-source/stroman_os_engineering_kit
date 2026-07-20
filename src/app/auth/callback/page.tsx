import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config";
import { CallbackView } from "@/ui/auth/callback-view";

export const metadata: Metadata = { title: "Signing in" };

export default function AuthCallbackPage() {
  return (
    <div className="grid min-h-svh place-items-center p-6">
      <div className="border-border bg-card shadow-elevation-1 w-full max-w-sm rounded-xl border p-6">
        <h1 className="mb-4 text-lg font-semibold tracking-tight">{APP_NAME}</h1>
        <CallbackView />
      </div>
    </div>
  );
}
