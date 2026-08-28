import * as React from "react";
import { cn } from "@/ui/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-card text-foreground placeholder:text-muted-foreground shadow-elevation-1 min-h-28 w-full resize-y rounded-lg border px-3.5 py-3 text-base transition-[border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-55 sm:text-sm",
        className,
      )}
      {...props}
    />
  );
}
