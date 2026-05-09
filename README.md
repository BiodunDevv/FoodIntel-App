# FoodIntel — Frontend

> AI-powered food recognition and nutrition tracking PWA — built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Redux Toolkit, TanStack Query, Framer Motion, Recharts, and the Microsoft Azure Translator API.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Getting Started](#getting-started)
6. [Architecture](#architecture)
7. [Pages & Routes](#pages--routes)
8. [Key Components](#key-components)
9. [State Management](#state-management)
10. [API Integration](#api-integration)
11. [Internationalisation — Azure Translator](#internationalisation--azure-translator)
12. [PWA & Mobile](#pwa--mobile)
13. [Gamification System](#gamification-system)
14. [Error Handling](#error-handling)
15. [Deployment](#deployment)
16. [Ethical Notice](#ethical-notice)

---

## Overview

FoodIntel is a mobile-first Progressive Web App that lets users photograph a meal and instantly receive:

- The identified food name and AI confidence score
- Full macro and micronutrient breakdown (calories, protein, carbs, fat, fibre, sodium)
- A rule-based health score (0–100) with colour-coded SVG ring visualisation
- Personalised health recommendations driven by the backend scoring engine
- A running meal history grouped and navigable by date
- Monthly nutrition reports with a heat-map calendar, calorie trend chart, and macro breakdown
- Gamification: XP points, levels, day streaks, and daily quests
- Full multilingual support powered by Microsoft Azure Cognitive Services Translator

The frontend communicates exclusively with the FoodIntel FastAPI backend. No nutrition data is computed client-side — every prediction, score, and recommendation comes from the API.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 16 |
| Language | TypeScript — strict mode, zero `any` | 5 |
| Styling | Tailwind CSS 4 (`@theme inline`, oklch palette) | 4 |
| Components | shadcn/ui (Radix UI primitives) | latest |
| Animations | Framer Motion | 11 |
| Server state | TanStack React Query | 5 |
| Client state | Redux Toolkit | 2 |
| Charts | Recharts | 2 |
| Forms | React Hook Form + Zod | — |
| Notifications | Sonner | — |
| Icons | Lucide React | — |
| Translations | Microsoft Azure Cognitive Services Translator | v3 |
| Image hosting | Cloudinary (unsigned direct upload) | — |
| Date utilities | date-fns | — |

---

## Project Structure

```
app/
├── app/
│   ├── (auth)/                       # Public, unauthenticated routes
│   │   ├── layout.tsx                # Centred card shell + language switcher
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── (app)/                        # Protected routes — require valid JWT
│   │   ├── layout.tsx                # AppShell — auth guard, sidebar/tab bar
│   │   ├── dashboard/page.tsx
│   │   ├── scan/page.tsx
│   │   ├── result/[id]/page.tsx
│   │   ├── history/page.tsx
│   │   ├── reports/
│   │   │   ├── page.tsx              # Monthly report + heat-map calendar
│   │   │   └── [date]/
│   │   │       ├── page.tsx          # Day detail — meal timeline + cards
│   │   │       └── loading.tsx       # Next.js automatic skeleton
│   │   ├── profile/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── api/
│   │   └── translate/route.ts        # Server-side Azure Translator proxy
│   │
│   ├── loading.tsx                   # Root-level skeleton
│   ├── not-found.tsx
│   ├── layout.tsx                    # Providers, PWA meta, fonts, Sonner
│   └── globals.css                   # @theme tokens, dark mode overrides
│
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx             # Responsive layout wrapper
│   │   ├── mobile-tab-bar.tsx        # Floating pill + raised scan FAB
│   │   ├── desktop-sidebar.tsx       # Nav + gamification summary
│   │   └── top-bar.tsx               # Logo, greeting, XP, language
│   ├── food/
│   │   ├── food-result-card.tsx      # Hero card: image, badges, macro grid
│   │   ├── upload-zone.tsx           # Drag-drop / camera / URL tabs
│   │   ├── health-score-card.tsx     # SVG ring with dynamic colour
│   │   ├── nutrition-card.tsx        # Macro bars with icons
│   │   ├── serving-size-selector.tsx
│   │   └── prediction-feedback-card.tsx  # Correct/report-correction form
│   ├── gamification/
│   │   ├── xp-ring.tsx
│   │   ├── streak-card.tsx
│   │   ├── quest-card.tsx
│   │   └── level-progress.tsx
│   ├── reports/
│   │   ├── calorie-trend-chart.tsx   # AreaChart with today ReferenceLine
│   │   └── macro-chart.tsx           # Donut PieChart
│   ├── logo/logo.tsx                 # LogoMark SVG + Logo (mark + wordmark)
│   ├── pwa/
│   │   ├── splash-screen.tsx         # Logo pulse on first load
│   │   ├── install-prompt.tsx        # beforeinstallprompt handler
│   │   └── offline-banner.tsx        # navigator.onLine listener
│   ├── i18n/language-switcher.tsx
│   ├── shared/
│   │   ├── page-header.tsx
│   │   └── empty-state.tsx
│   └── providers.tsx                 # QueryClient + Redux + Sonner
│
├── features/                         # Typed API calls per domain
│   ├── auth/auth.api.ts
│   ├── meals/
│   │   ├── meals.api.ts
│   │   └── meals.types.ts
│   ├── predictions/
│   │   ├── predictions.api.ts
│   │   └── predictions.types.ts
│   ├── reports/reports.api.ts
│   └── profile/profile.api.ts
│
├── hooks/
│   └── use-app-store.ts              # Typed useDispatch / useSelector
│
├── lib/
│   ├── api/client.ts                 # Typed fetch — ApiError class
│   ├── constants.ts
│   ├── utils.ts
│   ├── images.ts                     # resolveMealImageUrl
│   ├── cloudinary/upload.ts          # Direct unsigned Cloudinary upload
│   ├── gamification/
│   │   ├── rules.ts                  # XP event constants
│   │   └── levels.ts                 # Level title + threshold table
│   └── i18n/
│       ├── use-translation.ts        # Azure batch translate hook + localStorage cache
│       └── dictionaries/en.json      # ~200-key English source dictionary
│
├── store/
│   ├── index.ts
│   ├── provider.tsx
│   └── slices/
│       ├── auth-slice.ts             # token, user, hydrated
│       ├── language-slice.ts         # locale — persisted to localStorage
│       ├── gamification-slice.ts     # xp, level, streak, quests
│       └── ui-slice.ts               # sidebarOpen, isOffline, installPrompt
│
└── types/
    ├── api.ts
    ├── auth.ts
    ├── meals.ts
    ├── reports.ts
    └── gamification.ts
```

---

## Environment Variables

Create `foodintel-app/.env.local` (copy from `.env.example`):

```env
# FastAPI backend — local or deployed URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Cloudinary — unsigned direct upload from the browser
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# Microsoft Azure Cognitive Services Translator
# SERVER-SIDE ONLY — never exposed to the browser
AZURE_TRANSLATOR_KEY=your_azure_key
AZURE_TRANSLATOR_REGION=eastus
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
```

> `AZURE_TRANSLATOR_KEY` is read only inside `app/api/translate/route.ts`, a Next.js Route Handler that executes on the server. It is never bundled into client-side JavaScript.

---

## Getting Started

### Prerequisites

- Node.js 20+
- FoodIntel backend running on port 8000

### Install and run

```bash
cd foodintel-app
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

### Type check (must pass with zero errors)

```bash
npx tsc --noEmit
```

---

## Architecture

### Request lifecycle

```
Browser
  └── Next.js App Router
        └── (app)/layout.tsx
              └── checks authSlice.token
                    ├── null  → redirect /login
                    └── valid → render AppShell
                                  ├── DesktopSidebar  (≥md breakpoint)
                                  ├── MobileTabBar    (<md breakpoint)
                                  └── {page children}
                                        └── useQuery / useMutation
                                              └── features/*.api.ts
                                                    └── lib/api/client.ts
                                                          └── fetch()
                                                                └── FastAPI backend
```

### API client (`lib/api/client.ts`)

The `apiClient` typed wrapper:

- Injects `Authorization: Bearer <token>` from the Redux store on every request
- Automatically unwraps the `{ success, message, data }` envelope — callers receive `T` directly
- Throws a typed `ApiError` class on non-2xx responses with:
  - `.status` — HTTP status code
  - `.detail` — the full structured `detail` object from FastAPI (not just the message string)
  - `.message` — human-readable string safe to display
- Handles 422 low-confidence prediction errors by preserving the `top_prediction`, `confidence`, `runner_up`, and `confidence_threshold` fields for rich UI rendering

---

## Pages & Routes

### Public (no auth required)

| Route | Description |
|---|---|
| `/` | Landing page — animated hero, feature marquee, how-it-works |
| `/login` | Email + password sign-in with Zod validation |
| `/register` | Full-name, email, password registration |
| `/forgot-password` | Reset link request |

### Protected (valid JWT required)

| Route | Description |
|---|---|
| `/dashboard` | XP ring, day streak, daily quest card, last meal preview, weekly insight |
| `/scan` | Image upload / camera / URL input, serving-size picker, analyse button |
| `/result/[id]` | Food name, health-score ring, nutrition bars, XP card, feedback form |
| `/history` | All meals grouped by date, thumbnails, delete, tap to navigate to day |
| `/reports` | Month navigator, heat-map calendar, calorie trend chart, macro breakdown |
| `/reports/[date]` | Day summary, meal timeline bars, meal cards with delete confirm |
| `/profile` | User info display, edit-profile bottom sheet |
| `/settings` | Language switcher, dark mode, PWA install, sign out |

### Admin (secret-gated, no auth cookie required)

| Route | Description |
|---|---|
| `/admin-access` | Secret-gated admin panel — enter `ADMIN_SECRET` to unlock |

The admin panel is a standalone Next.js page (outside the `(app)` shell — no nav bar) that communicates directly with the backend admin JSON API. It provides:

- **Stats dashboard** — pending / approved / used in training / rejected counts
- **Retraining control** — trigger immediate retrain, force-bypass threshold, refresh live status with 8-second auto-poll while a job is running
- **Feedback review grid** — every `auto_approved` feedback item shown as a card with food image, predicted vs corrected label, confidence bar, user notes, and Approve / Reject buttons. Approved items become eligible for the next training run; rejected items are discarded
- **MobileNetV3 explainer** — collapsible panel explaining transfer learning, the confidence + margin gates, and the hot-reload pipeline
- **Daily auto-scheduler** — the backend fires retraining at midnight UTC automatically; the panel is only needed for reviewing feedback quality

> **Access:** navigate to `http://localhost:3000/admin-access` (or the deployed URL) and enter the value of `ADMIN_SECRET` from your backend `.env`.

---

## Key Components

### `UploadZone`

Three input modes via tab switcher (Upload file / Image URL):

- **Upload file** — drag-and-drop with spring-animated icon that reacts to hover; file name shown as an overlay chip on the preview
- **Camera** — `<input type="file" capture="environment">` triggers the rear camera on iOS/Android
- **Image URL** — paste URL, press Enter or click "Use URL"; image previews inline with an × dismiss overlay

### `FoodResultCard`

Hero card on the result page:

- Full image panel — clicking opens the photo full-size in a new tab (hover reveals an external-link icon overlay)
- Serving size chip overlaid on the image
- Colour-coded health-score badge and confidence-match badge (emerald / amber / red)
- Health-score progress bar with dynamic colour
- 4-column macro grid with coloured icons: Flame (calories), Beef (protein), Wheat (carbs), Droplets (fat)

### `MobileTabBar`

- Floating pill container: `rounded-2xl backdrop-blur-xl border-border/80 shadow-[0_8px_32px_rgba(0,0,0,0.14)]`
- Left pair: Dashboard, History
- Centre: Raised scan FAB — `absolute -top-6 size-[60px] rounded-full ring-4 ring-primary/20`, custom camera SVG (body path + lens circle)
- Right pair: Reports, Profile
- Active state: `h-0.5 w-5` primary-coloured indicator bar above the icon
- iOS notch / home-indicator support via `env(safe-area-inset-bottom)`

### `MonthCalendar` (inside `/reports`)

- 7-column CSS grid (Sun–Sat) with correct first-weekday offset via `date-fns getDay(startOfMonth(...))`
- Each day that has meals is coloured using oklch opacity interpolation: intensity = day calories / max calories that month — same concept as the GitHub contribution graph
- Hover tooltip: meal count + total calories
- Clicking a coloured day navigates to `/reports/YYYY-MM-DD`
- Today highlighted with a primary-coloured ring

### `PredictionFeedbackCard`

Inline feedback form on every result page:

- "Yes, looks right" — sends `is_correct: true`, queued as `confirmed`
- "Report a correction" — expands a form for the correct food name (slug-normalised) and optional notes, sent as `auto_approved` for model review
- All feedback is stored in the `prediction_feedback` MongoDB collection and exported by `ml/export_feedback_dataset.py` for retraining

---

## State Management

### Auth flow

```
POST /auth/login → { token, user }
  └── dispatch(setCredentials({ token, user }))
        └── localStorage.setItem("foodintel.token", token)
              └── authSlice.hydrated = true
                    └── AppShell renders protected content
```

On hard refresh, the auth slice middleware re-hydrates from `localStorage` before the first render — so protected pages never flash a login redirect for already-authenticated users.

### Redux slices

| Slice | State | Persistence |
|---|---|---|
| `authSlice` | `token`, `user`, `hydrated` | `localStorage` |
| `languageSlice` | `locale` | `localStorage` |
| `gamificationSlice` | `xp`, `levelIndex`, `streakDays`, `questsDone[]` | `localStorage` |
| `uiSlice` | `sidebarOpen`, `isOffline`, `installPromptVisible`, `splashDone` | Session only |

---

## API Integration

### Prediction flow

```
User picks image
  └── uploadImageToCloudinary(file)   ← lib/cloudinary/upload.ts
        └── Cloudinary returns { secure_url }
              └── predictMeal({ image_url: secure_url, serving_size_g })
                    └── POST /api/v1/predictions/image-url
                          └── backend fetches image, runs PyTorch inference
                                ├── confidence ≥ threshold → persist meal → return MealLogPublic
                                └── confidence < threshold → raise 422 with structured detail
                                      └── ApiError caught in scan page → amber "Food not identified" banner
```

### Key API calls

| Function | Endpoint | Used by |
|---|---|---|
| `login()` | `POST /auth/login` | Login page |
| `register()` | `POST /auth/register` | Register page |
| `getCurrentUser()` | `GET /auth/me` | AppShell hydration |
| `predictMeal()` | `POST /predictions/image-url` | Scan page |
| `getMeals({ limit: 500 })` | `GET /meals?limit=500` | History page |
| `getMeals({ date })` | `GET /meals?date=YYYY-MM-DD` | Report day page |
| `getMeal(id)` | `GET /meals/:id` | Result page |
| `deleteMeal(id)` | `DELETE /meals/:id` | History, report day |
| `getMonthlyReport(start, end)` | `GET /reports/weekly?start_date=&end_date=` | Reports page |
| `updateProfile()` | `PATCH /users/me` | Profile page |
| `submitFeedback()` | `POST /predictions/feedback` | Result page feedback card |

---

## Internationalisation — Azure Translator

### Architecture

```
useTranslation() hook
  └── reads locale from languageSlice
        ├── locale = "en"
        │     └── return baseDictionary (en.json, imported at build time)
        └── locale = "fr" / "yo" / "ha" / "ig" / other
              └── check localStorage["foodintel.translation.azure-v4.fr"]
                    ├── hit → parse JSON → return cached dictionary
                    └── miss → POST /api/translate { target: "fr", texts: [...all en values...] }
                                  └── Route Handler calls Azure Translator API
                                        └── returns translated values array
                                              └── zip with en.json keys → new dictionary
                                                    └── cache to localStorage + return
```

### Cache versioning

`TRANSLATION_CACHE_VERSION` in `use-translation.ts` (currently `"azure-v4"`) is incremented whenever `en.json` gains new keys. This invalidates all per-locale caches so Azure re-translates with the latest strings. Users see the new keys translated on their next page load.

### Adding a new UI string

1. Add to `lib/i18n/dictionaries/en.json`:
   ```json
   "myFeature.label": "My new label"
   ```
2. Increment `TRANSLATION_CACHE_VERSION` in `use-translation.ts`
3. Use in a component:
   ```typescript
   const { t } = useTranslation()
   return <p>{t("myFeature.label")}</p>
   ```

---

## PWA & Mobile

### Web App Manifest (`public/manifest.json`)

```json
{
  "name": "FoodIntel",
  "short_name": "FoodIntel",
  "display": "standalone",
  "theme_color": "#2d7a4f",
  "background_color": "#f9f7f4",
  "orientation": "portrait"
}
```

### iOS meta tags

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="theme-color" content="#2d7a4f" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

`viewport-fit=cover` enables `env(safe-area-inset-bottom)` in the mobile tab bar so the nav never overlaps the iPhone home indicator.

### Offline detection

`OfflineBanner` listens to `window.addEventListener("online" | "offline")` and dispatches `setOffline(bool)` to `uiSlice`. A non-blocking amber banner appears at the top of the app when offline, dismissing automatically on reconnect.

### Install prompt

`InstallPrompt` captures the `beforeinstallprompt` event, stores the deferred prompt, and dispatches `setInstallPromptVisible(true)` to `uiSlice`. The Settings page exposes the "Install App" button that calls `prompt()` on the deferred event.

---

## Gamification System

### XP Events

| Event | XP Awarded |
|---|---|
| Meal logged | +10 |
| Daily calorie goal met | +25 |
| Health score improvement | +15 |
| Weekly report viewed | +10 |
| 3-day logging streak | +30 |

### Level Table

| Level | Title | XP Threshold |
|---|---|---|
| 0 | Food Explorer | 0 |
| 1 | Smart Logger | 100 |
| 2 | Balanced Builder | 250 |
| 3 | Nutrition Strategist | 500 |
| 4 | Wellness Champion | 1,000 |

### Daily Quests

- Scan a meal today
- Log breakfast
- Stay within calorie goal
- Hit your protein goal

Quest completion state is stored in `gamificationSlice` and resets at midnight (client-side date comparison).

---

## Error Handling

### Low-confidence food prediction (422)

When the model cannot confidently identify the image, the backend returns:

```json
{
  "success": false,
  "detail": {
    "code": "unsupported_or_uncertain_image",
    "message": "I am not confident this image is one of the supported food classes.",
    "top_prediction": "rice",
    "confidence": 0.31,
    "runner_up": "beans",
    "runner_up_confidence": 0.18,
    "confidence_threshold": 0.50,
    "margin_threshold": 0.15
  }
}
```

The frontend `ApiError` class preserves the full `detail` object. The scan page renders a professional amber banner **below the Analyse button** (not at the top — users see it without scrolling) containing:

- "Food not identified" headline
- Explanation that the photo has been noted and the model will be trained on unrecognised foods in future updates
- Stat chips: best guess + confidence %, runner-up, minimum threshold required
- "Try a different photo" reset action

### Generic errors

Non-422 errors render a dismissible red card below the button. Raw "Request failed." strings from the network layer are stripped — the card shows only the clean title "Could not analyse image" and a connection tip.

---

## Deployment

### Vercel (recommended for frontend)

```bash
cd foodintel-app
vercel --prod
```

Set all environment variables in the Vercel project dashboard:

| Variable | Location | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Client + Server | Deployed backend URL |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client | Public |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Client | Unsigned preset |
| `AZURE_TRANSLATOR_KEY` | Server only | Never prefix with NEXT_PUBLIC_ |
| `AZURE_TRANSLATOR_REGION` | Server only | e.g. `eastus` |
| `AZURE_TRANSLATOR_ENDPOINT` | Server only | Azure API base URL |

### CORS

Ensure the FastAPI backend's `CORS_ORIGINS` setting includes the Vercel domain:

```env
# foodintel-backend/.env
CORS_ORIGINS=["https://your-app.vercel.app", "http://localhost:3000"]
```

---

## Ethical Notice

Nutritional values and health scores produced by FoodIntel are **estimates for educational and personal tracking purposes only**. They are not medical advice and must not be used to diagnose, treat, or manage any health condition. Always consult a registered dietitian or physician for personalised nutritional guidance.
