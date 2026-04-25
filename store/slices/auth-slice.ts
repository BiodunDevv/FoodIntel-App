import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type UserPublic = {
  id: string
  full_name: string
  email: string
  created_at: string
}

interface AuthState {
  token: string | null
  user: UserPublic | null
  hydrated: boolean
}

const initialState: AuthState = {
  token: null,
  user: null,
  hydrated: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuthState(state) {
      if (typeof window === "undefined") {
        state.hydrated = true
        return
      }
      try {
        const raw = localStorage.getItem("auth")
        if (raw) {
          const parsed = JSON.parse(raw) as { token: string; user: UserPublic }
          state.token = parsed.token ?? null
          state.user = parsed.user ?? null
        }
      } catch {
        // ignore parse errors
      }
      state.hydrated = true
    },
    setCredentials(state, action: PayloadAction<{ token: string; user: UserPublic }>) {
      state.token = action.payload.token
      state.user = action.payload.user
      if (typeof window !== "undefined") {
        localStorage.setItem("auth", JSON.stringify({ token: action.payload.token, user: action.payload.user }))
      }
    },
    setCurrentUser(state, action: PayloadAction<UserPublic>) {
      state.user = action.payload
      if (typeof window !== "undefined" && state.token) {
        localStorage.setItem("auth", JSON.stringify({ token: state.token, user: action.payload }))
      }
    },
    clearAuthState(state) {
      state.token = null
      state.user = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth")
      }
    },
  },
})

export const { hydrateAuthState, setCredentials, setCurrentUser, clearAuthState } = authSlice.actions
export default authSlice.reducer
