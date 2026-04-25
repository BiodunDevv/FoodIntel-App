"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Globe, Download, Bell, Info, LogOut } from "lucide-react"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { usePwaInstall } from "@/hooks/use-pwa-install"
import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { LogoutDialog } from "@/components/layout/logout-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  )
}

function SettingsRow({ icon: Icon, label, description, action }: {
  icon: React.ElementType
  label: string
  description?: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const user = useAppSelector((state) => state.auth.user)
  const { canInstall, install } = usePwaInstall()

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings.title")} description={t("settings.subtitle")} />

      {/* Account */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-sm font-semibold text-card-foreground">{t("settings.account")}</h2>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-foreground">{user?.full_name ?? "User"}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <SettingsSection title={t("settings.preferences")}>
        <SettingsRow
          icon={Globe}
          label={t("settings.language")}
          action={<LanguageSwitcher />}
        />
        <SettingsRow
          icon={theme === "dark" ? Moon : Sun}
          label={t("settings.darkMode")}
          description={t("settings.darkModeDesc")}
          action={
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                theme === "dark" ? "bg-primary" : "bg-muted"
              )}
              role="switch"
              aria-checked={theme === "dark"}
            >
              <span
                className={cn(
                  "inline-block size-3.5 rounded-full bg-white shadow transition-transform",
                  theme === "dark" ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
          }
        />
      </SettingsSection>

      {/* App */}
      <SettingsSection title={t("settings.app")}>
        <SettingsRow
          icon={Download}
          label={t("settings.installApp")}
          description={
            canInstall
              ? t("settings.installAppDesc")
              : "If install is unavailable, use your browser menu and choose Add to Home Screen."
          }
          action={
            <Button size="sm" onClick={install} disabled={!canInstall}>
              {t("settings.install")}
            </Button>
          }
        />
        <SettingsRow
          icon={Bell}
          label={t("settings.notifications")}
          description={t("settings.notificationsDesc")}
          action={
            <button
              className="relative inline-flex h-5 w-9 items-center rounded-full bg-muted transition-colors"
              role="switch"
              aria-checked={false}
            >
              <span className="inline-block size-3.5 translate-x-0.5 rounded-full bg-white shadow transition-transform" />
            </button>
          }
        />
      </SettingsSection>

      {/* System */}
      <SettingsSection title={t("settings.system")}>
        <SettingsRow
          icon={Info}
          label={t("settings.apiEndpoint")}
          description={API_BASE_URL}
          action={null}
        />
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground">{t("settings.disclaimer")}</p>
        </div>
      </SettingsSection>

      {/* Session */}
      <SettingsSection title={t("settings.session")}>
        <div className="px-4 py-3">
          <LogoutDialog
            trigger={
              <button className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors">
                <LogOut className="size-4" />
                {t("settings.signOut")}
              </button>
            }
          />
        </div>
      </SettingsSection>
    </div>
  )
}
