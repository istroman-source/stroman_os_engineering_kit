import { redirect } from "next/navigation";

// The MVP entry point is the projects workflow; a real dashboard is not built yet.
export default function DashboardPage() {
  redirect("/projects");
}
