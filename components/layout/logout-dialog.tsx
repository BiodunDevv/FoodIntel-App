"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useAppDispatch } from "@/hooks/use-app-store"
import { clearAuthState } from "@/store/slices/auth-slice"
import { useTranslation } from "@/lib/i18n/use-translation"
import { Button } from "@/components/ui/button"

interface LogoutDialogProps {
  trigger?: React.ReactNode
}

export function LogoutDialog({ trigger }: LogoutDialogProps) {
  const [open, setOpen] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { t } = useTranslation()

  const handleLogout = () => {
    dispatch(clearAuthState())
    router.push("/login")
    setOpen(false)
  }

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger ?? (
          <Button variant="ghost" size="icon-sm" aria-label={t("common.logout")}>
            <LogOut className="size-4" />
          </Button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl">
            <h2 className="mb-2 text-base font-semibold text-card-foreground">{t("common.logoutTitle")}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{t("common.logoutDesc")}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                {t("common.logoutCancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {t("common.logoutConfirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
