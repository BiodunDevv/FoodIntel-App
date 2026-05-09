"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Camera,
  Flame,
  ScanSearch,
  ShieldCheck,
  Trophy,
} from "lucide-react"

import { useAppSelector } from "@/hooks/use-app-store"
import { FixedMarqueeBar } from "@/components/landing/fixed-marquee-bar"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { Logo } from "@/components/logo/logo"
import { Button } from "@/components/ui/button"
import { SUPPORTED_MODEL_FOODS, formatFoodLabel } from "@/lib/supported-foods"

const steps = [
  {
    title: "Scan",
    description:
      "Capture a meal photo or upload one in a few taps without slowing down your day.",
    icon: Camera,
  },
  {
    title: "Understand",
    description:
      "See calories, macros, confidence, and a clear health signal instead of raw numbers only.",
    icon: ScanSearch,
  },
  {
    title: "Improve",
    description:
      "Build streaks, complete daily goals, and review better patterns over time.",
    icon: Trophy,
  },
]

const progressCards = [
  { title: "3-day streak", meta: "Consistency", icon: Flame },
  { title: "Level 4", meta: "410 XP", icon: Trophy },
  { title: "Weekly report", meta: "Ready Sunday", icon: BarChart3 },
  { title: "Gentle guidance", meta: "No guilt prompts", icon: ShieldCheck },
]

const storyImages = [
  {
    src: "https://plus.unsplash.com/premium_photo-1712920283885-1b4323bd5b8a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHJpY2UlMjBtZWFsfGVufDB8MHwwfHx8MA%3D%3D",
    alt: "A healthy bowl meal with vegetables and grains",
    title: "Balanced bowls",
    copy: "Meals with clear color, texture, and serving context help FoodIntel make more useful estimates.",
  },
  {
    src: "https://images.unsplash.com/photo-1664992960082-0ea299a9c53e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG5pZ2VyaWFuJTIwbWVhbHxlbnwwfDB8MHx8fDA%3D",
    alt: "Prepared meals on a dining table",
    title: "Real table meals",
  },
  {
    src: "https://images.unsplash.com/photo-1521986329282-0436c1f1e212?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhlYWx0aHklMjBmb29kfGVufDB8MHwwfHx8MA%3D%3D",
    alt: "Fresh ingredients arranged on a kitchen table",
    title: "Ingredient context",
  },
]

export default function LandingPage() {
  const { token, hydrated } = useAppSelector((state) => state.auth)
  const isLoggedIn = hydrated && Boolean(token)
  const primaryHref = isLoggedIn ? "/dashboard" : "/register"
  const primaryLabel = isLoggedIn ? "Open dashboard" : "Start scanning"
  const secondaryHref = isLoggedIn ? "/scan" : "#how-it-works"
  const secondaryLabel = isLoggedIn ? "Scan a meal" : "See how it works"
  const finalHref = isLoggedIn ? "/dashboard" : "/register"
  const finalLabel = isLoggedIn ? "Go to dashboard" : "Create free account"

  return (
    <div className="foodintel-page-bg min-h-screen pb-28 md:pb-32">
      <LandingNavbar />

      <main>
        <section className="foodintel-hero-grid foodintel-noise relative overflow-hidden">
          <div className="container-shell flex flex-col items-center pt-16 pb-32 text-center sm:py-20 md:pb-36 lg:py-28">
            <h1 className="mb-6 max-w-4xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-foreground">Your food</span>
              <span className="text-primary">, decoded in seconds.</span>
            </h1>

            <p className="mb-8 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              FoodIntel identifies meals from images, estimates nutrition,
              scores balance, and turns daily logging into a guided progress
              experience.
            </p>

            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              >
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            </div>

            <div className="relative mx-auto w-full max-w-4xl">
              <div className="relative overflow-hidden rounded-lg border bg-card shadow-lg md:hidden">
                <div className="flex items-center justify-between border-b bg-background/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2 bg-destructive" />
                    <div className="size-2 bg-yellow-400" />
                    <div className="size-2 bg-green-400" />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">app</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ScanSearch className="size-3 text-primary" />
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Detection
                    </p>
                    <p className="text-lg font-semibold">Jollof rice</p>
                    <p className="text-xs text-muted-foreground">
                      94% confidence
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary">
                    <ScanSearch className="size-3" />
                    Detected
                  </div>
                  <div className="space-y-2 border-t pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-semibold">82</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Flame className="size-3 text-primary" />
                      <span>3-day streak</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative hidden overflow-hidden rounded-lg border bg-card shadow-lg md:block">
                <div className="flex items-center justify-between border-b bg-background/60 px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-2.5 bg-destructive" />
                    <div className="size-2.5 bg-yellow-400" />
                    <div className="size-2.5 bg-green-400" />
                  </div>
                  <p className="font-mono text-xs tracking-wider text-muted-foreground">
                    FoodIntel.app
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ScanSearch className="size-3 text-primary" />
                    <span>Live</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 divide-x divide-border">
                  <div className="space-y-4 p-6">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Detection
                    </p>
                    <div>
                      <p className="text-2xl font-semibold">Jollof rice</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        94% confidence
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                      <ScanSearch className="size-3" />
                      Detected
                    </div>
                  </div>

                  <div className="space-y-4 p-6">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Nutrition
                    </p>
                    <div className="space-y-2">
                      {[
                        ["Calories", "438 kcal"],
                        ["Protein", "18 g"],
                        ["Carbs", "56 g"],
                      ].map(([label, val]) => (
                        <div
                          key={label}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 p-6">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Progress
                    </p>
                    <div>
                      <p className="text-3xl font-semibold">82</p>
                      <p className="text-sm text-muted-foreground">
                        Health score
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Flame className="size-3 text-primary" />
                      <span>3-day streak</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t bg-secondary/30 px-6 py-4">
                  <p className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Macros
                  </p>
                  <div className="flex h-2 flex-1 gap-1 overflow-hidden">
                    <div className="bg-primary" style={{ width: "28%" }} />
                    <div className="bg-accent" style={{ width: "52%" }} />
                    <div
                      className="bg-muted-foreground/30"
                      style={{ width: "20%" }}
                    />
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    18g · 56g · 12g
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="container-shell px-2 py-10 sm:py-12"
        >
          <div className="mb-6 max-w-2xl space-y-2">
            <p className="editorial-eyebrow">How it works</p>
            <h2 className="text-3xl font-medium tracking-[-0.04em] text-foreground">
              Built for everyday meals, not perfect studio plates.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {steps.map(({ title, description, icon: Icon }) => (
              <div key={title} className="premium-card p-5">
                <div className="mb-4 flex size-11 items-center justify-center bg-primary/8 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-medium text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-shell px-2 py-10 sm:py-12">
          <div className="grid gap-6 border-y border-border/70 py-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Current model coverage
              </p>
              <h2 className="text-3xl font-medium tracking-[-0.04em] text-foreground">
                FoodIntel recognizes {SUPPORTED_MODEL_FOODS.length} foods right now.
              </h2>
              <p className="max-w-md text-sm leading-7 text-muted-foreground">
                These are the classes available in the model currently deployed
                in the API. If an image is unclear or outside this list, the
                app now returns an uncertain result instead of forcing a wrong
                meal.
              </p>
              <p className="max-w-md text-xs leading-6 text-muted-foreground">
                More Nigerian and African meals will be added as reviewed images
                are collected and folded back into retraining.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
              {SUPPORTED_MODEL_FOODS.map((food) => (
                <div key={food} className="bg-background px-3 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {formatFoodLabel(food)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="container-shell px-2 py-10 sm:py-12">
          <div className="overflow-hidden rounded-[1.1rem] bg-[#232420] p-4 text-white shadow-[0_20px_50px_rgba(17,24,39,0.12)] md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-4">
                <p className="editorial-eyebrow text-white/55">
                  AI intelligence
                </p>
                <h2 className="text-3xl font-medium tracking-[-0.04em]">
                  A clear food pipeline, not a black-box wellness lecture.
                </h2>
                <p className="max-w-lg text-sm leading-7 text-white/70">
                  FoodIntel takes a meal photo, predicts the dish, estimates
                  nutrition, assigns a health score, and stores the log for
                  weekly reflection. The product is built for awareness, not
                  guilt.
                </p>
                <div className="flex flex-wrap gap-2 text-xs tracking-[0.15em] text-white/84 uppercase">
                  <span className="bg-white/10 px-3 py-1.5">
                    Model prediction
                  </span>
                  <span className="bg-white/10 px-3 py-1.5">
                    Nutrition lookup
                  </span>
                  <span className="bg-white/10 px-3 py-1.5">
                    Guided progress
                  </span>
                </div>
              </div>

              <div className="rounded-[1rem] bg-white/5 p-4 font-mono text-sm">
                {[
                  "image upload -> model prediction",
                  "predicted class -> food lookup",
                  "serving size -> nutrition estimate",
                  "nutrition -> health score",
                  "score -> recommendations",
                  "meal log -> weekly report",
                ].map((row, index) => (
                  <div
                    key={row}
                    className="mb-3 flex items-center gap-3 rounded-[0.85rem] bg-black/18 px-4 py-3 text-white/78 last:mb-0"
                  >
                    <span className="text-white/38">0{index + 1}</span>
                    <span>{row}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container-shell px-2 py-10 sm:py-12">
          <div className="mb-6 max-w-2xl space-y-2">
            <p className="editorial-eyebrow">Image intelligence</p>
            <h2 className="text-3xl font-medium tracking-[-0.04em] text-foreground">
              Better inputs lead to better meal understanding.
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              FoodIntel is designed around real food photography, ingredient
              context, and table scenes that look like actual meals instead of
              sterile studio shots.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="premium-card overflow-hidden p-2">
              <div className="relative h-[320px] overflow-hidden rounded-[0.9rem] md:h-[420px]">
                <Image
                  src={storyImages[0].src}
                  alt={storyImages[0].alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 text-white">
                  <p className="text-[11px] tracking-[0.18em] text-white/75 uppercase">
                    {storyImages[0].title}
                  </p>
                  <p className="mt-2 max-w-sm text-lg leading-7 font-medium">
                    {storyImages[0].copy}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {storyImages.slice(1).map((image) => (
                <div
                  key={image.title}
                  className="premium-card overflow-hidden p-2"
                >
                  <div className="relative h-[198px] overflow-hidden rounded-[0.9rem]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <p className="text-[11px] tracking-[0.18em] text-white/75 uppercase">
                        {image.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="progress" className="container-shell px-2 py-10 sm:py-12">
          <div className="mb-6 max-w-2xl space-y-2">
            <p className="editorial-eyebrow">Progress</p>
            <h2 className="text-3xl font-medium tracking-[-0.04em] text-foreground">
              Calm gamification that helps consistency feel rewarding.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {progressCards.map(({ title, meta, icon: Icon }) => (
              <div key={title} className="premium-card p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center bg-accent/12 text-accent">
                    <Icon className="size-4.5 text-primary" />
                  </div>
                  <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                    Active
                  </span>
                </div>
                <p className="text-xl font-medium text-foreground">{title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{meta}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="safety" className="container-shell px-2 py-10 sm:py-12">
          <div className="overflow-hidden rounded-[1.1rem] bg-primary p-5 text-primary-foreground shadow-[0_20px_50px_rgba(17,24,39,0.18)] md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="editorial-eyebrow text-primary-foreground/75">
                  Safety
                </p>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-primary-foreground">
                  FoodIntel provides nutrition estimates for awareness and
                  habit-building.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-primary-foreground/85">
                  It is not a medical diagnosis tool. Use it as a thoughtful
                  food journal with AI assistance, not as a replacement for
                  clinical advice.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  className="bg-white px-5 text-primary hover:bg-white/90"
                >
                  <Link href={finalHref}>
                    {finalLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/40 bg-transparent px-5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                >
                  <Link href={secondaryHref}>{secondaryLabel}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="container-shell px-2">
        <div className="rounded-2xl border border-border/60 bg-background/95 px-6 py-8 shadow-sm backdrop-blur-sm sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr] lg:gap-12">
            <div className="space-y-4">
              <Logo />
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                A premium AI nutrition companion for scanning meals, building
                awareness, and tracking healthier patterns over time.
              </p>
              <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground/80 uppercase">
                Smart nutrition insights, designed with clarity.
              </p>
            </div>

            <div className="grid gap-8 text-sm sm:grid-cols-3">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-foreground/80 uppercase">
                  Product
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link
                      href="/scan"
                      className="transition-colors hover:text-foreground"
                    >
                      Scan flow
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/reports"
                      className="transition-colors hover:text-foreground"
                    >
                      Reports
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/health-score"
                      className="transition-colors hover:text-foreground"
                    >
                      Health score
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-foreground/80 uppercase">
                  Platform
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="transition-colors hover:text-foreground">
                    PWA ready
                  </li>
                  <li className="transition-colors hover:text-foreground">
                    Privacy-aware uploads
                  </li>
                  <li className="transition-colors hover:text-foreground">
                    AI-assisted journaling
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-foreground/80 uppercase">
                  Company
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link
                      href="/about"
                      className="transition-colors hover:text-foreground"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="transition-colors hover:text-foreground"
                    >
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="transition-colors hover:text-foreground"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} FoodIntel. Built for thoughtful,
            data-informed food habits.
          </div>
        </div>
      </footer>

      <FixedMarqueeBar />
    </div>
  )
}
