# FoodIntel Frontend

FoodIntel is a premium, mobile-first PWA frontend for AI-powered food recognition and nutrition analysis. It is built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Redux Toolkit, React Query, and Recharts, and it integrates with the FastAPI backend at `http://localhost:8000/api/v1`.

## Overview

The frontend is designed as a calm, editorial health product rather than a generic dashboard. The landing page borrows high-level structural inspiration from Groq's product storytelling patterns, but all branding, layout details, copy, colors, and product framing are original to FoodIntel.

Users can:

- create an account and authenticate against the FastAPI backend
- scan food images and submit them to `POST /predictions/image`
- review meal results with confidence, nutrition, and recommendation summaries
- track meal history and delete entries
- view weekly reports with charts and summary cards
- manage profile data and preferences
- switch languages across the product
- install the app as a PWA

## Design Direction

- Warm ivory background with deep ink typography
- Forest green as the primary product color
- Clay/coral accent for energy and action states
- Premium editorial landing page with strong image panels and product storytelling
- App shell that feels like an installed mobile companion on small screens
- Mature gamification through XP, levels, streaks, achievements, and weekly insight

## Groq-Inspired Structure Note

The landing page uses a split hero, proof strip, dark technical section, large storytelling panels, and a confident CTA rhythm inspired by Groq's structural pacing. It does not copy Groq's logo, brand colors, copy, imagery, or exact layouts.

## Unsplash Image Usage

Remote imagery is used only for storytelling and atmosphere through `next/image`. Functional UI never depends on images. Unsplash is enabled in [next.config.mjs](/Users/mac/Desktop/FoodIntel%20FullStack/app/next.config.mjs:1).

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui components from `components/ui`
- Framer Motion
- Redux Toolkit + React Redux
- TanStack React Query
- React Hook Form
- Zod
- Recharts
- lucide-react
- next-themes
- Sonner

## Folder Structure

- `app/`: routes, layouts, offline page, translation API route
- `components/landing/`: marketing sections
- `components/layout/`: protected shell, sidebar, top bar, bottom tabs
- `components/food/`: upload, nutrition, result, recommendation UI
- `components/gamification/`: XP, streak, quest, achievement UI
- `components/reports/`: chart components
- `components/pwa/`: splash, install prompt, offline banner
- `components/i18n/`: language switcher
- `features/`: API contracts by domain
- `lib/api/`: API client and error handling
- `lib/i18n/`: dictionaries and translation hook
- `lib/gamification/`: XP and level rules
- `store/`: Redux store and slices

## shadcn/ui Usage

FoodIntel uses the existing `components/ui` contract for buttons, cards, forms, inputs, badges, dialogs, sheets, tabs, alerts, progress, skeletons, switches, select menus, and toasts. No duplicate primitive system was added outside `components/ui`.

## Global Theme Tokens

The core design system lives in [app/globals.css](/Users/mac/Desktop/FoodIntel%20FullStack/app/app/globals.css:1) and stays shadcn-compatible through CSS variables. It includes:

- light and dark OKLCH token sets
- page background and hero grid utilities
- subtle noise texture
- safe-area helpers
- mobile app shell spacing
- editorial eyebrow utility
- premium card and hero panel utilities

## PWA Setup

- Manifest: [public/manifest.json](/Users/mac/Desktop/FoodIntel%20FullStack/app/public/manifest.json:1)
- Icons: [public/icon.svg](/Users/mac/Desktop/FoodIntel%20FullStack/app/public/icon.svg:1), [public/icon-maskable.svg](/Users/mac/Desktop/FoodIntel%20FullStack/app/public/icon-maskable.svg:1)
- Offline page: [app/offline/page.tsx](/Users/mac/Desktop/FoodIntel%20FullStack/app/app/offline/page.tsx:1)
- Install prompt: [components/pwa/install-prompt.tsx](/Users/mac/Desktop/FoodIntel%20FullStack/app/components/pwa/install-prompt.tsx:1)
- Offline banner: [components/pwa/offline-banner.tsx](/Users/mac/Desktop/FoodIntel%20FullStack/app/components/pwa/offline-banner.tsx:1)
- Splash screen: [components/pwa/splash-screen.tsx](/Users/mac/Desktop/FoodIntel%20FullStack/app/components/pwa/splash-screen.tsx:1)

## Auth Flow

- Register: `POST /auth/register`
- Login: `POST /auth/login`
- Current user: `GET /auth/me`
- Profile update: `PATCH /users/me`

The token and user summary are stored in Redux and persisted to `localStorage`. Protected routes are wrapped by [components/layout/app-shell.tsx](/Users/mac/Desktop/FoodIntel%20FullStack/app/components/layout/app-shell.tsx:1), which redirects unauthenticated users to `/login`.

## Backend API Integration

The shared API client lives in [lib/api/client.ts](/Users/mac/Desktop/FoodIntel%20FullStack/app/lib/api/client.ts:1). It:

- reads `NEXT_PUBLIC_API_BASE_URL`
- normalizes wrapped backend responses
- attaches the Bearer token for protected calls
- clears auth on `401`
- supports JSON and multipart form requests

Feature modules:

- auth: `features/auth`
- meals: `features/meals`
- predictions: `features/predictions`
- reports: `features/reports`
- profile: `features/profile`

## React Query and Redux Architecture

Redux stores:

- auth token and user snapshot
- selected language
- gamification UI state
- offline and splash UI state

React Query handles:

- current user fetch
- meals
- single meal detail
- weekly report
- login/register/profile mutations
- prediction mutation
- meal deletion

## Translation System and Security Warning

Static dictionaries for `en`, `fr`, `yo`, `ha`, and `ig` live in `lib/i18n/dictionaries`.

- Hook: [lib/i18n/use-translation.ts](/Users/mac/Desktop/FoodIntel%20FullStack/app/lib/i18n/use-translation.ts:1)
- Switcher: [components/i18n/language-switcher.tsx](/Users/mac/Desktop/FoodIntel%20FullStack/app/components/i18n/language-switcher.tsx:1)
- Optional server route: [app/api/translate/route.ts](/Users/mac/Desktop/FoodIntel%20FullStack/app/app/api/translate/route.ts:1)

`TRANSLATOR_API_KEY` must remain server-only. Never expose it with `NEXT_PUBLIC_`.

## Cloudinary Setup

Cloudinary unsigned upload helpers live in [lib/cloudinary/upload.ts](/Users/mac/Desktop/FoodIntel%20FullStack/app/lib/cloudinary/upload.ts:1).

Required public env vars:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

Do not expose a Cloudinary API secret to the browser.

## Gamification Strategy

FoodIntel uses light-touch progression rather than childish game UI:

- `+10 XP` per logged meal
- level thresholds
- streak tracking
- simple achievements
- daily mission framing
- weekly insight cards

Rules live in `lib/gamification`.

## Animation System

Framer Motion is used sparingly for:

- landing hero entrance sequencing
- splash screen reveal and exit
- upload panel hover and preview motion
- health score ring animation
- compact card polish

Animations are kept subtle and aim to respect reduced motion behavior.

## Environment Variables

Use [.env.example](/Users/mac/Desktop/FoodIntel%20FullStack/app/.env.example:1) as the source of truth.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=FoodIntel
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=df4f0usnh
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ProfileX
TRANSLATOR_API_KEY=PASTE_TRANSLATOR_KEY_HERE_SERVER_ONLY
TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
TRANSLATOR_REGION=southafricanorth
```

## How To Run Locally

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env.local` from `.env.example`.

3. Start the FastAPI backend on `http://localhost:8000`.

4. Start the frontend:

```bash
pnpm dev
```

5. Open `http://localhost:3000`.

## How To Test With Backend

1. Register a user from `/register`.
2. Log in from `/login`.
3. Seed foods in the backend if needed with `POST /api/v1/foods/seed`.
4. Go to `/scan` and upload a meal image.
5. Verify the redirect to `/result/[id]`.
6. Check `/history` for the saved meal.
7. Check `/reports` for the updated weekly aggregation.
8. Update profile values in `/profile`.
9. Change language in `/settings` or auth pages.

## Verification

Completed locally:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

The build script uses webpack mode because Turbopack hit a sandbox-specific process-binding issue in this environment.

## Deployment Notes

- Set `NEXT_PUBLIC_API_BASE_URL` to the deployed FastAPI base path.
- Ensure the backend serves uploaded meal images from a reachable public origin.
- Configure translator env vars server-side only.
- Add production-grade PWA icons if shipping beyond portfolio/demo use.

## Known Limitations

- Forgot-password flow is a placeholder because the backend does not expose reset endpoints yet.
- PWA install UX depends on browser support for `beforeinstallprompt`.
- Translator route is optional and requires external Microsoft Translator credentials.
- Some gamification numbers are derived from current meal data rather than a dedicated backend progression system.

## Future Improvements

- Add server-driven achievements and streak persistence
- Support camera capture optimizations and crop controls
- Add richer meal filtering and grouping in history
- Extend weekly reports with more comparison views
- Add profile avatars and Cloudinary-backed upload UI
- Add offline mutation queues for deferred scans
# FoodIntel-App
