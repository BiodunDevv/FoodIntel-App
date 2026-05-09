export default function ReportDateLoading() {
  return (
    <div className="space-y-5">
      {/* back + title skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="space-y-1.5">
          <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-36 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      {/* summary card skeleton */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 h-3 w-24 animate-pulse rounded-md bg-muted" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-md bg-muted/60 p-2.5">
              <div className="mx-auto mb-1 h-6 w-12 animate-pulse rounded-md bg-muted" />
              <div className="mx-auto h-2.5 w-10 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-muted" />
      </div>

      {/* meal rows skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-20 animate-pulse rounded-md bg-muted" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3">
            <div className="size-12 shrink-0 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="flex gap-1">
              <div className="size-7 animate-pulse rounded-md bg-muted" />
              <div className="size-7 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
