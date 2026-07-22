import {
  Brain,
  LayoutDashboard,
  FolderKanban,
  Settings,
  SearchCheck,
  type LucideIcon,
} from "lucide-react";

/**
 * Primary navigation for the application shell.
 *
 * Foundation scope: only the sections that exist as empty shells today. Per the
 * UI/UX spec, navigation must not imply that unfinished sections are
 * operational — so nothing is listed here until it has a real destination.
 */
export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

export const navItems: readonly NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/knowledge", label: "Memory", icon: Brain },
  { href: "/acquisition", label: "Acquisition", icon: SearchCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];
