import { API_ORIGIN } from "@/lib/constants"

export function resolveMealImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) return ""
  if (imageUrl.startsWith("data:image/")) return imageUrl
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl
  if (imageUrl.startsWith("/")) return `${API_ORIGIN}${imageUrl}`
  return imageUrl
}
