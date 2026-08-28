import * as React from "react";
import { cn } from "@/ui/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card"
      className={cn(
        "border-border bg-card text-card-foreground shadow-elevation-1 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="card-header" className={cn("space-y-1.5 p-5 sm:p-6", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="card-title"
      className={cn("text-lg leading-6 font-semibold tracking-[-0.015em]", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm leading-6", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn("border-border flex items-center gap-3 border-t px-5 py-4 sm:px-6", className)}
      {...props}
    />
  );
}
