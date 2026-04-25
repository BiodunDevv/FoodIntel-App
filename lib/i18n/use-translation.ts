"use client"

import { useCallback, useEffect, useState } from "react"
import { useAppSelector } from "@/hooks/use-app-store"
import enDictionary from "@/lib/i18n/dictionaries/en.json"

type Dictionary = Record<string, string>

const cache: Record<string, Dictionary> = {}
const baseDictionary = enDictionary as Dictionary
const TRANSLATION_CACHE_VERSION = "azure-only-v1"

cache.en = baseDictionary

function getStorageKey(locale: string) {
  return `foodintel.translation.${TRANSLATION_CACHE_VERSION}.${locale}`
}

function readCachedDictionary(locale: string): Dictionary | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(getStorageKey(locale))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Dictionary
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

function writeCachedDictionary(locale: string, dict: Dictionary) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(getStorageKey(locale), JSON.stringify(dict))
  } catch {
    // ignore storage failures
  }
}

async function translateDictionary(locale: string): Promise<Dictionary> {
  if (locale === "en") return baseDictionary
  if (cache[locale]) return cache[locale]

  const cachedDict = readCachedDictionary(locale)
  if (cachedDict) {
    cache[locale] = cachedDict
    return cachedDict
  }

  const entries = Object.entries(baseDictionary)
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: locale,
      texts: entries.map(([, value]) => value),
    }),
  })

  if (!response.ok) {
    throw new Error("Translation request failed")
  }

  const payload = (await response.json()) as { translations?: string[] }
  const translatedValues = payload.translations ?? entries.map(([, value]) => value)

  const translatedDictionary = Object.fromEntries(
    entries.map(([key], index) => [key, translatedValues[index] ?? baseDictionary[key]])
  ) as Dictionary

  cache[locale] = translatedDictionary
  writeCachedDictionary(locale, translatedDictionary)
  return translatedDictionary
}

export function useTranslation() {
  const locale = useAppSelector((state) => state.language.locale)
  const [dict, setDict] = useState<Dictionary>(cache[locale] ?? baseDictionary)

  useEffect(() => {
    let active = true

    translateDictionary(locale)
      .then((nextDict) => {
        if (active) {
          setDict(nextDict)
        }
      })
      .catch(() => {
        if (active) {
          setDict(baseDictionary)
        }
      })

    return () => {
      active = false
    }
  }, [locale])

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return dict[key] ?? fallback ?? key
    },
    [dict]
  )

  const translateText = useCallback(
    async (text: string, target = locale) => {
      if (!text || target === "en") {
        return text
      }

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, target }),
        })

        if (!response.ok) {
          throw new Error("Translation request failed")
        }

        const payload = (await response.json()) as { translation?: string }
        return payload.translation ?? text
      } catch {
        return text
      }
    },
    [locale]
  )

  return { t, locale, translateText }
}
