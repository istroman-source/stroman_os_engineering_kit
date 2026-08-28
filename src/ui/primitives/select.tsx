import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/ui/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  readonly wrapperClassName?: string;
}

export function Select({ className, wrapperClassName, children, ...props }: SelectProps) {
  return (
    <span className={cn("relative block", wrapperClassName)}>
      <select
        data-slot="select"
        className={cn(
          "border-input bg-card text-foreground shadow-elevation-1 min-h-11 w-full appearance-none rounded-lg border py-2.5 pr-10 pl-3.5 text-base transition-[border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-55 sm:text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
      />
    </span>
  );
}
