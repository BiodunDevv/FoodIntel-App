import type { Metadata, Viewport } from "next"

import "./globals.css"
import { Providers } from "@/store/provider"
import { APP_NAME } from "@/lib/constants"
import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { PwaBootstrap } from "@/components/pwa/pwa-bootstrap"

const manrope = Manrope({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "AI-powered food recognition and nutrition tracking",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
}

export const viewport: Viewport = {
  themeColor: "#c10007",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", manrope.variable)}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <PwaBootstrap />
          {children}
        </Providers>
      </body>
    </html>
  )
}
