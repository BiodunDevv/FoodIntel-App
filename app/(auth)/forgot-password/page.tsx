"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeft, Mail } from "lucide-react"

import { useTranslation } from "@/lib/i18n/use-translation"
import { Logo } from "@/components/logo/logo"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { FixedMarqueeBar } from "@/components/landing/fixed-marquee-bar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const schema = z.object({
  email: z.string().email("Invalid email address"),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1000))
    setSent(true)
    toast.success("Reset link sent! Check your email.")
  }

  return (
    <div className="auth-backdrop auth-grid foodintel-noise flex h-screen flex-col overflow-hidden pb-14">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm">

            {/* Controls row — directly above card */}
            <div className="mb-3 flex items-center justify-between">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="bg-white/60 px-3 h-8 text-xs">
                  <ArrowLeft className="size-3.5" />
                  {t("forgotPassword.backToLogin")}
                </Button>
              </Link>
                <Logo size={22} showText={false} />
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-border/60 bg-white/90 shadow-[0_16px_48px_rgba(17,24,39,0.10)] backdrop-blur-sm">
              <div className="px-7 pt-7 pb-2 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/8">
                  <Mail className="size-5 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {t("forgotPassword.title")}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t("forgotPassword.subtitle")}
                </p>
              </div>

              <div className="px-7 pb-7 pt-5">
                {sent ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-foreground">
                      We&apos;ve sent a password reset link to your email address. Please check your inbox.
                    </p>
                    <Link href="/login" className="block">
                      <Button variant="ghost" size="sm" className="w-full bg-muted/70">
                        {t("forgotPassword.backToLogin")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        {t("forgotPassword.email")}
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={cn(
                          "w-full border bg-white/80 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow",
                          errors.email ? "border-destructive" : "border-border/70"
                        )}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t("common.loading") : t("forgotPassword.submit")}
                    </Button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <FixedMarqueeBar />
    </div>
  )
}
