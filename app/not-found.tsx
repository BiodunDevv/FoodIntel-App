import Link from "next/link"
import { Home, ScanSearch } from "lucide-react"
import { LogoMark } from "@/components/logo/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <LogoMark size={40} className="mx-auto text-primary" />
        <h1 className="mt-5 text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you opened doesn&apos;t exist anymore or the link is incomplete.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="w-full gap-2 sm:w-auto">
              <Home className="size-4" />
              Go home
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
