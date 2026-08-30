import type { Metadata } from "next";
import { LocationDetailView } from "@/ui/locations/location-detail-view";

export const metadata: Metadata = { title: "Room" };

export default async function LocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locationId: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { locationId } = await params;
  const { returnTo } = await searchParams;
  const backTo =
    typeof returnTo === "string" &&
    returnTo.startsWith("/") &&
    !returnTo.startsWith("//") &&
    !returnTo.includes("\\")
      ? returnTo
      : undefined;
  return <LocationDetailView locationId={locationId} returnTo={backTo} />;
}
