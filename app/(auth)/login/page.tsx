"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

import { login } from "@/features/auth/auth.api"
import { setCredentials } from "@/store/slices/auth-slice"
import { useAppDispatch } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { Logo } from "@/components/logo/logo"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { FixedMarqueeBar } from "@/components/landing/fixed-marquee-bar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      dispatch(setCredentials({ token: data.access_token, user: data.user }))
      toast.success("Welcome back!")
      router.push("/dashboard")
    },
    onError: (err: Error) => {
      toast.error(err.message || t("common.error"))
    },
  })

  return (
    <div className="auth-backdrop auth-grid foodintel-noise flex h-screen flex-col overflow-hidden pb-14">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm">

            {/* Controls row — directly above card */}
            <div className="mb-3 flex items-center justify-between">
              <Link href="/">
                <Button variant="ghost" size="sm" className="bg-background/60 px-3 h-8 text-xs">
                  <ArrowLeft className="size-3.5" />
                  {t("common.back")}
                </Button>
              </Link>
                <Logo showText={false} />
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-border/60 bg-card/90 shadow-[0_16px_48px_rgba(17,24,39,0.10)] backdrop-blur-sm">
              <div className="px-7 pt-7 pb-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {t("login.title")}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">{t("login.subtitle")}</p>
              </div>

              <div className="px-7 pb-7 pt-5">
                <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      {t("login.email")}
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={cn(
                        "w-full rounded-lg border bg-background/80 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow",
                        errors.email ? "border-destructive" : "border-border/70"
                      )}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        {t("login.password")}
                      </label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        {t("login.forgotPassword")}
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className={cn(
                          "w-full rounded-lg border bg-background/80 px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow",
                          errors.password ? "border-destructive" : "border-border/70"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isPending}
                  >
                    {isPending ? t("common.loading") : t("login.submit")}
                  </Button>
                </form>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  {t("login.noAccount")}{" "}
                  <Link href="/register" className="font-medium text-primary hover:underline">
                    {t("login.createAccount")}
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <FixedMarqueeBar />
    </div>
  )
}
