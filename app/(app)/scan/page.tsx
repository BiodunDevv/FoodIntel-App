"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { ScanLine } from "lucide-react"
import { predictMeal } from "@/features/predictions/predictions.api"
import { useAppSelector } from "@/hooks/use-app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { uploadImageToCloudinary } from "@/lib/cloudinary/upload"
import { UploadZone } from "@/components/food/upload-zone"
import { ServingSizeSelector } from "@/components/food/serving-size-selector"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"

export default function ScanPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { token } = useAppSelector((state) => state.auth)

  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [servingSize, setServingSize] = useState(100)
  const [description, setDescription] = useState("")
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const hasInput = file !== null || imageUrl !== ""

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("Please sign in again to analyze a meal.")
      }

      if (file) {
        setUploadStatus("Uploading image to Cloudinary...")
        const upload = await uploadImageToCloudinary(file)
        setUploadStatus("Image uploaded. Running food analysis...")
        return predictMeal(
          {
            image_url: upload.secure_url,
            serving_size_g: servingSize,
          },
          token
        )
      }

      if (imageUrl) {
        setUploadStatus("Running food analysis...")
        return predictMeal(
          {
            image_url: imageUrl,
            serving_size_g: servingSize,
          },
          token
        )
      }

      throw new Error("Upload an image or provide an image URL first.")
    },
    onSuccess: (data) => {
      setUploadStatus(null)
      toast.success(`Detected: ${data.meal.predicted_food}`)
      router.push(`/result/${data.meal.id}`)
    },
    onError: (err: Error) => {
      setUploadStatus(null)
      toast.error(err.message || t("common.error"))
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader title={t("scan.title")} description={t("scan.subtitle")} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload zone */}
        <UploadZone
          file={file}
          imageUrl={imageUrl}
          onFileChange={setFile}
          onImageUrlChange={setImageUrl}
        />

        {/* Meal details */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-card-foreground">{t("scan.mealDetails")}</h2>

          <ServingSizeSelector value={servingSize} onChange={setServingSize} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {t("scan.description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Jollof rice with grilled chicken..."
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <Button
            className="w-full gap-2"
            disabled={!hasInput || isPending}
            onClick={() => mutate()}
          >
            <ScanLine className="size-4" />
            {isPending ? t("scan.analyzing") : t("scan.analyze")}
          </Button>

          {uploadStatus && (
            <p className="text-center text-xs text-muted-foreground">{uploadStatus}</p>
          )}

          {!hasInput && (
            <p className="text-center text-xs text-muted-foreground">
              Upload an image or enter a URL to analyze
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
