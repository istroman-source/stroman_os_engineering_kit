import type { Metadata } from "next";
import { PageHeader } from "@/ui/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Workspace and account settings. Configuration surfaces arrive in later build steps."
      />
      <div className="border-border bg-card text-muted-foreground rounded-lg border p-8 text-sm">
        No settings available yet.
      </div>
    </div>
  );
}
