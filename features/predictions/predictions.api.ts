import { apiClient } from "@/lib/api/client"
import type {
  PredictionFeedbackInput,
  PredictionFeedbackResult,
  PredictionInput,
  PredictionResult,
} from "./predictions.types"

export function predictMeal(input: PredictionInput, token: string): Promise<PredictionResult> {
  if (input.image_url) {
    return apiClient.post<PredictionResult>(
      "/predictions/image-url",
      { image_url: input.image_url, serving_size_g: input.serving_size_g ?? 100 },
      { token }
    )
  }

  if (!input.file) {
    throw new Error("Either file or image_url must be provided")
  }

  const formData = new FormData()
  formData.append("file", input.file)
  if (input.serving_size_g !== undefined) {
    formData.append("serving_size_g", String(input.serving_size_g))
  }

  return apiClient.post<PredictionResult>("/predictions/image", formData, { token, isFormData: true })
}

export function submitPredictionFeedback(
  payload: PredictionFeedbackInput,
  token: string
): Promise<PredictionFeedbackResult> {
  return apiClient.post<PredictionFeedbackResult>("/predictions/feedback", payload, { token })
}
