"use client"

import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Loader2, MessageSquareWarning, Sparkles } from "lucide-react"
import { submitPredictionFeedback } from "@/features/predictions/predictions.api"
import type { PredictionFeedbackInput } from "@/features/predictions/predictions.types"
import type { Meal } from "@/features/meals/meals.types"
import { useAppSelector } from "@/hooks/use-app-store"
import { Button } from "@/components/ui/button"

interface PredictionFeedbackCardProps {
  meal: Meal
}

function slugifyFoodName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export function PredictionFeedbackCard({ meal }: PredictionFeedbackCardProps) {
  const { token } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<"idle" | "correct" | "incorrect">("idle")
  const [foodName, setFoodName] = useState("")
  const [notes, setNotes] = useState("")
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null)

  const suggestedSlug = useMemo(() => slugifyFoodName(foodName), [foodName])

  const feedbackMutation = useMutation({
    mutationFn: async (payload: PredictionFeedbackInput) => {
      if (!token) {
        throw new Error("Please sign in again to submit feedback.")
      }
      return submitPredictionFeedback(payload, token)
    },
    onSuccess: (result) => {
      setSubmittedMessage(
        result.retraining_message ||
          result.message ||
          "Thanks. Your feedback has been saved for model improvement."
      )
      void queryClient.invalidateQueries({ queryKey: ["meal", meal.id] })
      void queryClient.invalidateQueries({ queryKey: ["meals"] })
    },
  })

  const handleConfirmCorrect = () => {
    setMode("correct")
    feedbackMutation.mutate({
      meal_id: meal.id,
      is_correct: true,
    })
  }

  const handleSubmitCorrection = () => {
    if (!suggestedSlug) return

    setMode("incorrect")
    feedbackMutation.mutate({
      meal_id: meal.id,
      is_correct: false,
      corrected_slug: suggestedSlug,
      notes: notes.trim() || undefined,
    })
  }

  const isBusy = feedbackMutation.isPending
  const existingFeedbackMessage = meal.feedback
    ? meal.feedback.is_correct
      ? "You marked this prediction as correct."
      : `You corrected this prediction to ${meal.feedback.corrected_food}.`
    : null

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-primary/10">
          <MessageSquareWarning className="size-5 text-primary" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Was this prediction correct?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your feedback helps FoodIntel improve future predictions without interrupting your
              meal flow.
            </p>
          </div>

          {submittedMessage || existingFeedbackMessage ? (
            <div className="rounded-lg border border-border bg-background/80 p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Feedback saved</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {submittedMessage || existingFeedbackMessage}
                  </p>
                  {meal.feedback?.notes ? (
                    <p className="mt-1 text-sm text-muted-foreground">{meal.feedback.notes}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={handleConfirmCorrect}
                  disabled={isBusy}
                >
                  {isBusy && mode === "correct" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  Yes, it looks right
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setMode((current) => (current === "incorrect" ? "idle" : "incorrect"))}
                  disabled={isBusy}
                >
                  <Sparkles className="size-4" />
                  Report a correction
                </Button>
              </div>

              {mode === "incorrect" && (
                <div className="grid gap-3 rounded-lg border border-border bg-background/60 p-3">
                  <div className="grid gap-1.5">
                    <label htmlFor="correct-food-name" className="text-sm font-medium text-foreground">
                      Correct food name
                    </label>
                    <input
                      id="correct-food-name"
                      value={foodName}
                      onChange={(event) => setFoodName(event.target.value)}
                      placeholder="Plantain"
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {suggestedSlug ? (
                      <p className="text-xs text-muted-foreground">
                        Saved as slug: <span className="font-medium text-foreground">{suggestedSlug}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-1.5">
                    <label htmlFor="feedback-notes" className="text-sm font-medium text-foreground">
                      Note for the model review
                    </label>
                    <textarea
                      id="feedback-notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Optional context, for example: this was fried plantain, not rice and stew."
                      className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {feedbackMutation.isError ? (
                    <p className="text-sm text-destructive">
                      {feedbackMutation.error instanceof Error
                        ? feedbackMutation.error.message
                        : "We could not save your feedback right now."}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      onClick={handleSubmitCorrection}
                      disabled={isBusy || !suggestedSlug}
                      className="gap-2"
                    >
                      {isBusy && mode === "incorrect" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <MessageSquareWarning className="size-4" />
                      )}
                      Submit correction
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMode("idle")}
                      disabled={isBusy}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
