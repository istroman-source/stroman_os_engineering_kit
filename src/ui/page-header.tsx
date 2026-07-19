/**
 * Consistent page heading (title + optional description). Keeps top-of-page
 * typography uniform across routes.
 */
export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8 space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
    </div>
  );
}
