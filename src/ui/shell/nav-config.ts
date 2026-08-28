import { Clapperboard, MapPin, Settings, type LucideIcon } from "lucide-react";

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

export const navItems: readonly NavItem[] = [
  { href: "/projects", label: "Projects", icon: Clapperboard },
  { href: "/locations", label: "Locations", icon: MapPin },
];

export const secondaryNavItems: readonly NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];
