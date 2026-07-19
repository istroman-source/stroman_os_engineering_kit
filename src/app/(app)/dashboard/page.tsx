import type { Metadata } from "next";
import { PageHeader } from "@/ui/page-header";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your creative decisions at a glance. Content arrives in a later build step."
      />
      <div className="border-border bg-card text-muted-foreground rounded-lg border p-8 text-sm">
        Nothing to show yet.
      </div>
    </div>
  );
}
