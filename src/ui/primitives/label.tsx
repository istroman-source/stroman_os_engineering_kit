import * as React from "react";
import { cn } from "@/ui/cn";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn("text-foreground block text-sm leading-5 font-semibold", className)}
      {...props}
    />
  );
}
