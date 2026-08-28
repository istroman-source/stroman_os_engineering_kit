import type { Metadata } from "next";
import { PageHeader } from "@/ui/page-header";
import { LocationsView } from "@/ui/locations/locations-view";

export const metadata: Metadata = { title: "Locations" };

function safeReturnTo(value: string | string[] | undefined) {
  const path = typeof value === "string" ? value : undefined;
  return path && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\")
    ? path
    : undefined;
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { returnTo } = await searchParams;
  return (
    <div>
      <PageHeader
        title="Locations"
        description="Prepare real rooms once, then reuse them across your stories."
      />
      <LocationsView returnTo={safeReturnTo(returnTo)} />
    </div>
  );
}
