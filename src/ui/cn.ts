import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, resolving conflicting Tailwind utilities predictably.
 * This is the styling primitive every component composes with.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
