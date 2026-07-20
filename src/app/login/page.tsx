import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config";
import { LoginView } from "@/ui/auth/login-view";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-svh place-items-center p-6">
      <div className="border-border bg-card shadow-elevation-1 w-full max-w-sm rounded-xl border p-6">
        <h1 className="mb-1 text-lg font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-muted-foreground mb-5 text-sm">Sign in with a one-time email link.</p>
        <LoginView />
      </div>
    </div>
  );
}
