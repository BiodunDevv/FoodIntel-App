import { LogoMark } from "@/components/logo/logo"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <LogoMark size={48} animated className="mx-auto text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading FoodIntel...</p>
      </div>
    </div>
  )
}
