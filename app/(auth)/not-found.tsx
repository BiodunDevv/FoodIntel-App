import Link from "next/link"
import { ArrowLeft, LogIn } from "lucide-react"
import { LogoMark } from "@/components/logo/logo"
import { Button } from "@/components/ui/button"

export default function AuthNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <LogoMark size={40} className="mx-auto text-primary" />
        <h1 className="mt-5 text-2xl font-semibold text-foreground">We couldn&apos;t find that auth page</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The sign-in or onboarding link is invalid. Head back to login and continue from there.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button className="w-full gap-2 sm:w-auto">
              <LogIn className="size-4" />
              Go to login
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <ArrowLeft className="size-4" />
              Back home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
