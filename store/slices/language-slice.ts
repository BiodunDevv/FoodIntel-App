import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type Locale = "en" | "fr" | "yo" | "ha" | "ig"

interface LanguageState {
  locale: Locale
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en"
  try {
    const stored = localStorage.getItem("locale") as Locale | null
    if (stored && ["en", "fr", "yo", "ha", "ig"].includes(stored)) return stored
  } catch {
    // ignore
  }
  return "en"
}

const languageSlice = createSlice({
  name: "language",
  initialState: (): LanguageState => ({ locale: getInitialLocale() }),
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem("locale", action.payload)
      }
    },
  },
})

export const { setLocale } = languageSlice.actions
export default languageSlice.reducer
