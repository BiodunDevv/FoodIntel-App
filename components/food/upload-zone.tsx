"use client"

import { useRef, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Upload, Camera, Link2, X, RefreshCw, ImageIcon, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface UploadZoneProps {
  file: File | null
  imageUrl: string
  onFileChange: (file: File | null) => void
  onImageUrlChange: (url: string) => void
}

type Tab = "upload" | "url"

export function UploadZone({
  file,
  imageUrl,
  onFileChange,
  onImageUrlChange,
}: UploadZoneProps) {
  const [tab, setTab] = useState<Tab>("upload")
  const [dragging, setDragging] = useState(false)
  const [urlInput, setUrlInput] = useState(imageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const preview = file ? URL.createObjectURL(file) : imageUrl || null
  const hasPreview = Boolean(preview)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped && dropped.type.startsWith("image/")) {
        onFileChange(dropped)
      }
    },
    [onFileChange]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFileChange(f)
  }

  const handleRemove = () => {
    onFileChange(null)
    onImageUrlChange("")
    setUrlInput("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Tab switcher */}
      <div className="flex border-b border-border">
        {(["upload", "url"] as const).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold tracking-wide transition-all",
              tab === tabKey
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tabKey === "upload" ? (
              <>
                <Upload className="size-3.5" />
                Upload file
              </>
            ) : (
              <>
                <Link2 className="size-3.5" />
                Image URL
              </>
            )}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "upload" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative flex min-h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200",
              dragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : hasPreview
                  ? "border-primary/40 bg-transparent"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <AnimatePresence mode="wait">
              {hasPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full p-3"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview!}
                      alt="Preview"
                      className="max-h-52 w-full rounded-lg object-contain"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <CheckCircle2 className="size-3 text-green-400" />
                      {file ? file.name.slice(0, 24) + (file.name.length > 24 ? "…" : "") : "Image URL"}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemove}
                      className="gap-1.5 rounded-lg"
                    >
                      <X className="size-3.5" />
                      Remove
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5 rounded-lg"
                    >
                      <RefreshCw className="size-3.5" />
                      Change
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-4 px-6 py-8 text-center"
                >
                  <motion.div
                    animate={dragging ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                      "flex size-16 items-center justify-center rounded-2xl transition-colors duration-200",
                      dragging ? "bg-primary/20" : "bg-muted"
                    )}
                  >
                    <ImageIcon className={cn("size-8 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
                  </motion.div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {dragging ? "Drop it here!" : "Drag & drop an image here"}
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-px w-8 bg-border" />
                    or drag and drop
                    <span className="h-px w-8 bg-border" />
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1.5 rounded-lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="size-3.5" />
                      Choose image
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1.5 rounded-lg"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="size-3.5" />
                      Open camera
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {tab === "url" && (
          <div className="space-y-3">
            <AnimatePresence>
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative mb-3 overflow-hidden rounded-xl border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-h-48 w-full object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-opacity hover:bg-black/80"
                      aria-label="Remove image"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onImageUrlChange(urlInput) }}
                placeholder="https://example.com/food.jpg"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              <Button
                type="button"
                size="sm"
                className="gap-1.5 rounded-lg"
                onClick={() => onImageUrlChange(urlInput)}
                disabled={!urlInput.trim()}
              >
                <Link2 className="size-3.5" />
                Use URL
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Paste a direct link to a food photo (JPG, PNG, WEBP)
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileInput}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileInput}
      />
    </div>
  )
}
