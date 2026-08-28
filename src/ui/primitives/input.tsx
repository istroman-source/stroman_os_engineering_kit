import * as React from "react";
import { cn } from "@/ui/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "border-input bg-card text-foreground placeholder:text-muted-foreground shadow-elevation-1 min-h-11 w-full rounded-lg border px-3.5 py-2.5 text-base transition-[border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-55 sm:text-sm",
        "file:text-foreground file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold",
        className,
      )}
      {...props}
    />
  );
}
