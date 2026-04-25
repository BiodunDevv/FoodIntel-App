"use client"

import { useRef, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Upload, Camera, Link2, X, RefreshCw, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface UploadZoneProps {
  file: File | null
  imageUrl: string
  onFileChange: (file: File | null) => void
  onImageUrlChange: (url: string) => void
}

type Tab = "upload" | "url"

export function UploadZone({ file, imageUrl, onFileChange, onImageUrlChange }: UploadZoneProps) {
  const [tab, setTab] = useState<Tab>("upload")
  const [dragging, setDragging] = useState(false)
  const [urlInput, setUrlInput] = useState(imageUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  const preview = file ? URL.createObjectURL(file) : imageUrl || null

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type.startsWith("image/")) {
      onFileChange(dropped)
    }
  }, [onFileChange])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFileChange(f)
  }

  const handleRemove = () => {
    onFileChange(null)
    onImageUrlChange("")
    setUrlInput("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Tab switcher */}
      <div className="mb-4 flex rounded-md border border-border overflow-hidden">
        {(["upload", "url"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium transition-colors",
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "upload" ? "Upload file" : "Image URL"}
          </button>
        ))}
      </div>

      {tab === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex min-h-48 flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          )}
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-56 w-full rounded-md object-contain"
                />
                <div className="mt-3 flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleRemove} className="gap-1.5">
                    <X className="size-3.5" />
                    Remove image
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="gap-1.5">
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
                className="flex flex-col items-center gap-3 p-6 text-center"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Drag & drop an image here</p>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => inputRef.current?.click()}>
                    <Upload className="size-3.5" />
                    Choose image
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Camera className="size-3.5" />
                    Use camera
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {tab === "url" && (
        <div className="space-y-3">
          {imageUrl && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="mb-3 max-h-48 w-full rounded-md border border-border object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <Button variant="outline" size="sm" onClick={handleRemove} className="mb-3 gap-1.5">
                  <X className="size-3.5" />
                  Remove image
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/food.jpg"
              className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => onImageUrlChange(urlInput)}
            >
              <Link2 className="size-3.5" />
              Use URL
            </Button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileInput}
      />
    </div>
  )
}
