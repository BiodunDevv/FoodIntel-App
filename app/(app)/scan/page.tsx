"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Info,
  Utensils,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { predictMeal } from "@/features/predictions/predictions.api"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { uploadImageToCloudinary } from "@/lib/cloudinary/upload"
import { ApiError } from "@/lib/api/client"
import { UploadZone } from "@/components/food/upload-zone"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LowConfidenceState {
  topPrediction: string
  confidence: number
  runnerUp: string | null
  runnerUpConfidence: number
  threshold: number
  margin: number
  marginThreshold: number
}

export default function ScanPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { token } = useAppSelector((state) => state.auth)

  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [servingSize, setServingSize] = useState(100)
  const [stepLabel, setStepLabel] = useState("")
  const [lowConfidence, setLowConfidence] = useState<LowConfidenceState | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const hasInput = file !== null || imageUrl !== ""

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Please sign in again.")

      if (file) {
        setStepLabel(t("scan.uploadingImage"))
        const upload = await uploadImageToCloudinary(file)
        setStepLabel(t("scan.analysingFood"))
        return predictMeal({ image_url: upload.secure_url, serving_size_g: servingSize }, token)
      }

      if (imageUrl) {
        setStepLabel(t("scan.analysingFood"))
        return predictMeal({ image_url: imageUrl, serving_size_g: servingSize }, token)
      }

      throw new Error("Upload an image or provide a URL first.")
    },
    onSuccess: (data) => {
      router.push(`/result/${data.meal.id}`)
    },
    onError: (err: unknown) => {
      setStepLabel("")
      setLowConfidence(null)
      setErrorMessage(null)

      if (
        err instanceof ApiError &&
        (err.detail?.code === "unsupported_or_uncertain_image" || err.status === 422)
      ) {
        setLowConfidence({
          topPrediction: (err.detail?.top_prediction ?? "Unknown").replace(/_/g, " "),
          confidence: Math.round((err.detail?.confidence ?? 0) * 100),
          runnerUp: err.detail?.runner_up ? err.detail.runner_up.replace(/_/g, " ") : null,
          runnerUpConfidence: Math.round((err.detail?.runner_up_confidence ?? 0) * 100),
          threshold: Math.round((err.detail?.confidence_threshold ?? 0.5) * 100),
          margin: Math.round((err.detail?.margin ?? 0) * 100),
          marginThreshold: Math.round((err.detail?.margin_threshold ?? 0.12) * 100),
        })
      } else {
        // Strip generic "Request failed" noise — show a clean message
        const raw = err instanceof Error ? err.message : ""
        const msg = !raw || raw.startsWith("Request failed") ? "" : raw
        setErrorMessage(msg)
      }
    },
  })

  const clearErrors = () => {
    setLowConfidence(null)
    setErrorMessage(null)
  }

  const reset = () => {
    setFile(null)
    setImageUrl("")
    clearErrors()
    setStepLabel("")
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("scan.title")}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{t("scan.subtitle")}</p>
      </div>

      {/* Upload zone */}
      <UploadZone
        file={file}
        imageUrl={imageUrl}
        onFileChange={(f) => { setFile(f); clearErrors() }}
        onImageUrlChange={(u) => { setImageUrl(u); clearErrors() }}
      />

      {/* Serving size */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-card-foreground">
              {t("scan.servingSizeLabel")}
            </span>
          </div>
          <span className="text-sm font-bold text-primary">{servingSize}g</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[50, 100, 150, 200, 250, 300, 400].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setServingSize(g)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                servingSize === g
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {g}g
            </button>
          ))}
        </div>
        <input
          type="range"
          min={50}
          max={500}
          step={10}
          value={servingSize}
          onChange={(e) => setServingSize(Number(e.target.value))}
          className="mt-3 w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>50g</span>
          <span>500g</span>
        </div>
      </div>

      {/* Analyse button */}
      <Button
        className="w-full h-12 gap-2.5 rounded-xl text-sm font-semibold shadow-sm"
        disabled={!hasInput || isPending}
        onClick={() => { clearErrors(); mutate() }}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {stepLabel || t("scan.analyzing")}
          </>
        ) : hasInput ? (
          <>
            <CheckCircle2 className="size-4" />
            {t("scan.analyzeFood")}
          </>
        ) : (
          t("scan.analyzeFood")
        )}
      </Button>

      {/* States below button */}
      <AnimatePresence>
        {!hasInput && !isPending && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-xs text-muted-foreground"
          >
            {t("scan.uploadFirst")}
          </motion.p>
        )}

        {/* Low-confidence / food not identified */}
        {lowConfidence && (
          <motion.div
            key="low-confidence"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30"
          >
            <div className="flex items-start gap-3 p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {t("scan.unrecognised.title")}
                </p>
                <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                  {t("scan.unrecognised.desc")}
                </p>
                <div className="rounded-xl border border-amber-200 bg-white/55 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
                  {t("scan.unrecognised.notSaved")}
                </div>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                      {t("scan.unrecognised.bestGuess")}
                    </span>
                    <span className="text-xs font-bold capitalize text-amber-800 dark:text-amber-200">
                      {lowConfidence.topPrediction}
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {lowConfidence.confidence}%
                    </span>
                  </div>
                  {lowConfidence.runnerUp && lowConfidence.runnerUpConfidence > 5 && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1">
                      <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                        {t("scan.unrecognised.runnerUp")}
                      </span>
                      <span className="text-xs font-bold capitalize text-amber-800 dark:text-amber-200">
                        {lowConfidence.runnerUp}
                      </span>
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        {lowConfidence.runnerUpConfidence}%
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                      {t("scan.unrecognised.threshold")}
                    </span>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                      {lowConfidence.threshold}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                      {t("scan.unrecognised.margin")}
                    </span>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                      {lowConfidence.margin}% / {lowConfidence.marginThreshold}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {t("scan.unrecognised.tip")}
                </p>
              </div>
              <button
                onClick={() => setLowConfidence(null)}
                className="shrink-0 rounded-full p-1 text-amber-500 transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/40"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex border-t border-amber-200 bg-amber-100/60 px-4 py-2.5 dark:border-amber-800/40 dark:bg-amber-900/20">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 transition-colors hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
              >
                <RefreshCw className="size-3.5" />
                {t("scan.unrecognised.retry")}
              </button>
            </div>
          </motion.div>
        )}

        {errorMessage !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/6 p-4"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-destructive">{t("scan.error.title")}</p>
              {errorMessage && (
                <p className="mt-0.5 text-xs text-destructive/70">{errorMessage}</p>
              )}
              <p className="mt-0.5 text-xs text-destructive/60">{t("scan.error.tip")}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="shrink-0 text-destructive/50 hover:text-destructive transition-colors"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="rounded-2xl border border-border bg-card/60 p-4">
        <div className="mb-2.5 flex items-center gap-2">
          <Info className="size-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">{t("scan.tipsTitle")}</span>
        </div>
        <ul className="space-y-1.5">
          {(["scan.tip1", "scan.tip2", "scan.tip3", "scan.tip4"] as const).map((key) => (
            <li key={key} className="flex items-start gap-1.5">
              <ChevronRight className="mt-0.5 size-3 shrink-0 text-primary" />
              <span className="text-xs leading-snug text-muted-foreground">{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
