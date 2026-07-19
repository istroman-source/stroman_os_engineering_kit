import { redirect } from "next/navigation";

// The application entry point sends users to the dashboard.
export default function RootPage() {
  redirect("/dashboard");
}
