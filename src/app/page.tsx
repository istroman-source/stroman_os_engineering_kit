import { redirect } from "next/navigation";

// The application entry point goes straight to the filmmaker's project library.
export default function RootPage() {
  redirect("/projects");
}
