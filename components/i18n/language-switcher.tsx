"use client"

import { useAppDispatch, useAppSelector } from "@/hooks/use-app-store"
import { setLocale } from "@/store/slices/language-slice"
import { ChevronDown } from "lucide-react"

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "yo", label: "Yorùbá", flag: "🇳🇬" },
  { code: "ha", label: "Hausa", flag: "🇳🇬" },
  { code: "ig", label: "Igbo", flag: "🇳🇬" },
] as const

type Locale = (typeof LANGUAGES)[number]["code"]

interface LanguageSwitcherProps {
  compact?: boolean
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const dispatch = useAppDispatch()
  const locale = useAppSelector((state) => state.language.locale)
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0]

  return (
    <div className="relative inline-flex items-center">
      <select
        value={locale}
        onChange={(e) => dispatch(setLocale(e.target.value as Locale))}
        className="absolute inset-0 cursor-pointer opacity-0 w-full h-full"
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1.5 border border-border/60 bg-background/80 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm select-none pointer-events-none">
        <span className="text-sm leading-none">{current.flag}</span>
        {!compact && (
          <span className="tracking-tight">{current.label}</span>
        )}
        <ChevronDown className="size-3 text-muted-foreground" />
      </div>
    </div>
  )
}
