import Link from "next/link"
import { ArrowLeft, History, ScanSearch } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4">
      <div className="w-full rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Nothing here yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page or meal result you requested could not be found. It may have been deleted or the
          link may be outdated.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button className="w-full gap-2 sm:w-auto">
              <ArrowLeft className="size-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <History className="size-4" />
              History
            </Button>
          </Link>
          <Link href="/scan">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <ScanSearch className="size-4" />
              Scan food
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
