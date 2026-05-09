"use client"

import { Suspense, useEffect, useRef, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  RefreshCw, Zap, CheckCircle2, XCircle, Brain, ChevronDown, ChevronUp,
  ShieldAlert, Clock, Cpu, Activity, LogOut,
} from "lucide-react"
import { Logo } from "@/components/logo/logo"
import { API_ORIGIN } from "@/lib/constants"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────────

interface RetrainingStatus {
  running: boolean
  status: string
  message: string
  last_started_at: string | null
  last_finished_at: string | null
  last_exit_code: number | null
}

interface FeedbackItem {
  id: string
  image_url?: string
  predicted_label?: string
  corrected_label?: string
  corrected_slug?: string
  confidence: number
  feedback_type?: string
  user_notes?: string
  created_at?: string
  status: string
}

interface RunRecord {
  run_id: number
  triggered_by: string
  started_at: string
  finished_at: string | null
  status: "queued" | "running" | "completed" | "failed" | "waiting"
  message: string
  exit_code: number | null
  samples_used: number
  log_lines: string[]
}

interface AdminPageData {
  pending_items: FeedbackItem[]
  pending_count: number
  approved_count: number
  used_count: number
  rejected_count: number
  retraining_status: RetrainingStatus
  settings: { retrain_min_feedback_samples: number; prediction_confidence_threshold: number; prediction_margin_threshold: number }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function imageUrl(url: string | undefined): string | null {
  if (!url) return null
  if (url.startsWith("http") || url.startsWith("data:")) return url
  if (url.startsWith("/uploads/")) return `${API_ORIGIN}${url}`
  return null
}

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—"
  return iso.slice(0, 16).replace("T", " ") + " UTC"
}

function slugToTitle(s: string | undefined | null): string {
  if (!s) return "Unknown"
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function confidenceColor(c: number): string {
  if (c >= 0.8) return "text-green-400"
  if (c >= 0.6) return "text-amber-400"
  return "text-red-400"
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("text-3xl font-bold", color)}>{value}</p>
    </div>
  )
}

function Toast({ msg, type, onDone }: { msg: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
      className={cn(
        "fixed bottom-6 right-6 z-50 max-w-xs rounded-xl border px-4 py-3 text-sm font-medium shadow-xl",
        type === "success"
          ? "border-green-500/40 bg-green-950/80 text-green-300"
          : "border-red-500/40 bg-red-950/80 text-red-300"
      )}
    >
      {msg}
    </motion.div>
  )
}

function ExplainerBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <h4 className="mb-2 text-xs font-bold text-primary">{title}</h4>
      <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}

function FeedbackCard({
  item,
  onApprove,
  onReject,
}: {
  item: FeedbackItem
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [done, setDone] = useState<"approved" | "rejected" | null>(null)
  const src = imageUrl(item.image_url)

  async function handle(action: "approve" | "reject") {
    setLoading(action)
    try {
      if (action === "approve") await onApprove(item.id)
      else await onReject(item.id)
      setDone(action === "approve" ? "approved" : "rejected")
    } finally {
      setLoading(null)
    }
  }

  return (
    <motion.div
      layout
      animate={done ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "overflow-hidden rounded-xl border bg-card transition-colors",
        done === "approved" && "border-green-500/60",
        done === "rejected" && "border-red-500/40 opacity-50",
        !done && "border-border"
      )}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={item.predicted_label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
          {slugToTitle(item.predicted_label)}
        </span>
        <span className={cn("absolute bottom-2 right-2 text-xs font-bold", confidenceColor(item.confidence))}>
          {(item.confidence * 100).toFixed(1)}%
        </span>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {item.corrected_label && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Corrected</span>
            <span className="font-semibold text-green-400">{slugToTitle(item.corrected_label)}</span>
          </div>
        )}
        {item.feedback_type && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Type</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {item.feedback_type}
            </span>
          </div>
        )}
        {item.user_notes && (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs italic text-muted-foreground leading-relaxed">
            &ldquo;{item.user_notes}&rdquo;
          </p>
        )}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {fmt(item.created_at)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-3 pb-3">
        <button
          onClick={() => handle("approve")}
          disabled={!!loading || !!done}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-500 disabled:opacity-40"
        >
          {loading === "approve" ? <RefreshCw className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
          Approve
        </button>
        <button
          onClick={() => handle("reject")}
          disabled={!!loading || !!done}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-40"
        >
          {loading === "reject" ? <RefreshCw className="size-3 animate-spin" /> : <XCircle className="size-3" />}
          Reject
        </button>
      </div>
    </motion.div>
  )
}

// ── Run history panel ─────────────────────────────────────────────────────────

function statusMeta(status: RunRecord["status"]): { label: string; color: string; dot: string } {
  switch (status) {
    case "completed": return { label: "Completed", color: "text-green-400", dot: "bg-green-400" }
    case "failed":    return { label: "Failed",    color: "text-red-400",   dot: "bg-red-400" }
    case "running":   return { label: "Running",   color: "text-blue-400",  dot: "bg-blue-400 animate-pulse" }
    case "queued":    return { label: "Queued",    color: "text-amber-400", dot: "bg-amber-400 animate-pulse" }
    default:          return { label: "Waiting",   color: "text-muted-foreground", dot: "bg-muted-foreground" }
  }
}

function duration(start: string, end: string | null): string {
  if (!end) return "—"
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 0) return "—"
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function RunRow({ run }: { run: RunRecord }) {
  const [open, setOpen] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const meta = statusMeta(run.status)

  useEffect(() => {
    if (open && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [open, run.log_lines.length])

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden transition-colors", open ? "border-border" : "border-border/60")}>
      {/* Row header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition"
      >
        <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} />
        <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">#{run.run_id}</span>
        <span className={cn("text-xs font-semibold w-20 shrink-0", meta.color)}>{meta.label}</span>
        <span className="flex-1 text-xs text-muted-foreground truncate">{run.message}</span>
        <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:block">
          {run.samples_used} sample{run.samples_used !== 1 ? "s" : ""}
        </span>
        <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:block w-12 text-right">
          {duration(run.started_at, run.finished_at)}
        </span>
        <span className="text-[11px] text-muted-foreground shrink-0 hidden md:block w-36 text-right">
          {fmt(run.started_at)}
        </span>
        <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground shrink-0 capitalize">
          {run.triggered_by}
        </span>
        {open ? <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" /> : <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />}
      </button>

      {/* Expanded log */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
              {/* Meta row */}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span><span className="text-foreground/50">Started:</span> {fmt(run.started_at)}</span>
                {run.finished_at && <span><span className="text-foreground/50">Finished:</span> {fmt(run.finished_at)}</span>}
                <span><span className="text-foreground/50">Duration:</span> {duration(run.started_at, run.finished_at)}</span>
                <span><span className="text-foreground/50">Samples:</span> {run.samples_used}</span>
                {run.exit_code !== null && run.exit_code !== undefined && (
                  <span className={run.exit_code === 0 ? "text-green-400" : "text-red-400"}>
                    Exit code: {run.exit_code}
                  </span>
                )}
              </div>

              {/* Log output */}
              {run.log_lines.length > 0 ? (
                <div
                  ref={logRef}
                  className="max-h-64 overflow-y-auto rounded-lg bg-[#0a0c14] border border-border/60 p-3 font-mono text-[11px] leading-relaxed text-emerald-300 space-y-0.5"
                >
                  {run.log_lines.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-all">
                      <span className="select-none text-muted-foreground/40 mr-2">{String(i + 1).padStart(3, "0")}</span>
                      <span className={
                        line.toLowerCase().includes("error") || line.toLowerCase().includes("failed")
                          ? "text-red-400"
                          : line.toLowerCase().includes("warning") || line.toLowerCase().includes("warn")
                          ? "text-amber-400"
                          : line.toLowerCase().includes("completed") || line.toLowerCase().includes("success") || line.toLowerCase().includes("reloaded")
                          ? "text-green-400"
                          : "text-emerald-300/80"
                      }>{line}</span>
                    </div>
                  ))}
                  {run.status === "running" && (
                    <div className="flex items-center gap-1.5 text-blue-400 mt-1">
                      <RefreshCw className="size-3 animate-spin" />
                      <span>Training in progress…</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No log output captured yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RunHistoryPanel({ history, loading }: { history: RunRecord[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <RefreshCw className="size-4 animate-spin" />
        Loading history…
      </div>
    )
  }
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
        <Cpu className="mx-auto mb-3 size-10 text-muted-foreground/40" />
        <p className="font-semibold text-sm">No runs yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Retrain history will appear here once a job has been triggered.</p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {history.map((run) => <RunRow key={run.run_id} run={run} />)}
    </div>
  )
}

// ── Secret gate ────────────────────────────────────────────────────────────────

function SecretGate({ onUnlock }: { onUnlock: (secret: string) => void }) {
  const [value, setValue] = useState("")
  const [error, setError] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) { setError(true); return }
    onUnlock(value.trim())
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo size={44} />
          <div>
            <h1 className="text-xl font-bold">Admin Access</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your admin secret to continue</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false) }}
            placeholder="Admin secret…"
            className={cn(
              "w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary",
              error ? "border-red-500" : "border-border"
            )}
            autoFocus
          />
          {error && <p className="text-xs text-red-400">Secret is required.</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <ShieldAlert className="mr-2 inline-block size-4" />
            Unlock Panel
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

function AdminAccessInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [secret, setSecret] = useState<string | null>(searchParams.get("secret"))
  const [data, setData] = useState<AdminPageData | null>(null)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const [retrainLoading, setRetrainLoading] = useState(false)
  const [showExplainer, setShowExplainer] = useState(false)
  const [history, setHistory] = useState<RunRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const adminBase = `${API_ORIGIN}/admin`

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
  }, [])

  const fetchData = useCallback(async (sec: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${adminBase}/feedback?secret=${sec}`)
      if (res.status === 403) {
        setAuthError(true)
        setSecret(null)
        return
      }
      if (!res.ok) throw new Error("Failed to load")
      const json = await res.json()
      setData(json.data)
    } catch {
      showToast("Failed to load admin data.", "error")
    } finally {
      setLoading(false)
    }
  }, [adminBase, showToast])

  const fetchHistory = useCallback(async (sec: string) => {
    setHistoryLoading(true)
    try {
      const res = await fetch(`${adminBase}/retraining-history?secret=${sec}`)
      if (res.ok) {
        const json = await res.json()
        setHistory(json.data ?? [])
      }
    } catch { /* ignore */ } finally {
      setHistoryLoading(false)
    }
  }, [adminBase])

  useEffect(() => {
    if (!secret) return
    const timeout = window.setTimeout(() => {
      fetchData(secret)
      fetchHistory(secret)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [secret, fetchData, fetchHistory])

  // Poll status + history every 8s when running
  useEffect(() => {
    if (!data?.retraining_status.running || !secret) return
    pollRef.current = setInterval(async () => {
      try {
        const [sRes, hRes] = await Promise.all([
          fetch(`${adminBase}/retraining-status?secret=${secret}`),
          fetch(`${adminBase}/retraining-history?secret=${secret}`),
        ])
        if (sRes.ok) {
          const d = await sRes.json()
          setData((prev) => prev ? { ...prev, retraining_status: d.data } : prev)
        }
        if (hRes.ok) {
          const d = await hRes.json()
          setHistory(d.data ?? [])
        }
      } catch { /* ignore */ }
    }, 8000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [data?.retraining_status.running, secret, adminBase])

  async function handleApprove(id: string) {
    const res = await fetch(`${adminBase}/feedback/${id}/approve?secret=${secret}`, { method: "POST" })
    const d = await res.json()
    if (!res.ok) throw new Error(d.detail ?? "Failed to approve.")
    showToast("Approved — queued for training.")
    setData((prev) => prev ? {
      ...prev,
      pending_items: prev.pending_items.filter((i) => i.id !== id),
      pending_count: prev.pending_count - 1,
      approved_count: prev.approved_count + 1,
    } : prev)
  }

  async function handleReject(id: string) {
    const res = await fetch(`${adminBase}/feedback/${id}/reject?secret=${secret}`, { method: "POST" })
    const d = await res.json()
    if (!res.ok) throw new Error(d.detail ?? "Failed to reject.")
    showToast("Rejected.", "error")
    setData((prev) => prev ? {
      ...prev,
      pending_items: prev.pending_items.filter((i) => i.id !== id),
      pending_count: prev.pending_count - 1,
      rejected_count: prev.rejected_count + 1,
    } : prev)
  }

  async function handleRetrain(force = false) {
    setRetrainLoading(true)
    try {
      const res = await fetch(`${adminBase}/retrain?secret=${secret}&force=${force}`, { method: "POST" })
      const d = await res.json()
      showToast(d.message, d.triggered ? "success" : "error")
      if (d.triggered) {
        setData((prev) => prev ? { ...prev, retraining_status: { ...prev.retraining_status, running: true, status: "queued", message: d.message } } : prev)
        if (secret) setTimeout(() => fetchHistory(secret), 1500)
      }
    } catch {
      showToast("Network error.", "error")
    } finally {
      setRetrainLoading(false)
    }
  }

  async function refreshStatus() {
    if (!secret) return
    try {
      const res = await fetch(`${adminBase}/retraining-status?secret=${secret}`)
      const d = await res.json()
      setData((prev) => prev ? { ...prev, retraining_status: d.data } : prev)
      showToast("Status refreshed.")
    } catch {
      showToast("Could not refresh.", "error")
    }
  }

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 size-12 text-red-400" />
          <h1 className="text-xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">Invalid admin secret.</p>
          <button onClick={() => { setAuthError(false); setSecret(null) }} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!secret) return <SecretGate onUnlock={(s) => setSecret(s)} />

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
          <Logo size={40} />
        </motion.div>
      </div>
    )
  }

  const rs = data.retraining_status
  const statusColor = rs.running ? "text-blue-400" : rs.status === "completed" ? "text-green-400" : rs.status === "failed" ? "text-red-400" : "text-muted-foreground"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Logo size={28} />
          <span className="rounded-full border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400">
            Secret Panel
          </span>
          <div className="flex-1" />
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", statusColor)}>
            <span className={cn("size-2 rounded-full", rs.running ? "bg-blue-400 animate-pulse" : rs.status === "completed" ? "bg-green-400" : rs.status === "failed" ? "bg-red-400" : "bg-muted-foreground")} />
            {rs.running ? "Retraining…" : rs.status === "completed" ? "Last run completed" : rs.status === "failed" ? "Last run failed" : "Idle"}
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition"
          >
            <LogOut className="size-3.5" />
            Exit
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Pending Review" value={data.pending_count} color="text-amber-400" />
          <StatCard label="Approved" value={data.approved_count} color="text-green-400" />
          <StatCard label="Used in Training" value={data.used_count} color="text-blue-400" />
          <StatCard label="Rejected" value={data.rejected_count} color="text-red-400" />
          <StatCard label="Min Samples" value={data.settings?.retrain_min_feedback_samples ?? 5} color="text-muted-foreground" />
        </div>

        {/* Retraining control */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start gap-5">
            <div className="flex-1 min-w-52">
              <div className="mb-1 flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                <h3 className="font-semibold">Retraining Control</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{rs.message}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {rs.last_started_at && <span><span className="text-foreground/60">Started:</span> {fmt(rs.last_started_at)}</span>}
                {rs.last_finished_at && <span><span className="text-foreground/60">Finished:</span> {fmt(rs.last_finished_at)}</span>}
                {rs.last_exit_code !== null && rs.last_exit_code !== undefined && (
                  <span><span className="text-foreground/60">Exit code:</span> {rs.last_exit_code}</span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Auto-scheduler fires daily at midnight UTC. Only &ldquo;approved&rdquo; feedback samples are used.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-w-44">
              <button
                onClick={() => handleRetrain(false)}
                disabled={retrainLoading || rs.running}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-40"
              >
                {retrainLoading ? <RefreshCw className="size-4 animate-spin" /> : <Zap className="size-4" />}
                Trigger Retrain
              </button>
              <button
                onClick={() => handleRetrain(true)}
                disabled={retrainLoading || rs.running}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-2 text-xs font-semibold transition hover:bg-muted/80 disabled:opacity-40"
              >
                Force (bypass threshold)
              </button>
              <button
                onClick={refreshStatus}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-2 text-xs font-medium transition hover:bg-muted/80"
              >
                <RefreshCw className="size-3.5" />
                Refresh Status
              </button>
            </div>
          </div>
        </div>

        {/* MobileNetV3 explainer (collapsible) */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setShowExplainer((v) => !v)}
            className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-muted/40"
          >
            <Brain className="size-5 text-primary shrink-0" />
            <span className="font-semibold text-sm flex-1">How the Model Works — MobileNetV3 Transfer Learning</span>
            {showExplainer ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showExplainer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid gap-3 p-5 pt-0 sm:grid-cols-2">
                  <ExplainerBlock title="What is MobileNetV3?">
                    MobileNetV3-Small is a lightweight CNN pre-trained by Google on ImageNet (1.28M images, 1,000 classes).
                    It acts as a rich visual feature extractor — understanding textures, shapes, and colour patterns — before
                    FoodIntel ever sees a food photo.
                  </ExplainerBlock>
                  <ExplainerBlock title="Transfer Learning">
                    FoodIntel replaces MobileNetV3&rsquo;s final classification head with a new layer trained on 27 food classes.
                    The convolutional backbone is frozen during early fine-tuning to preserve ImageNet knowledge, making
                    training fast and data-efficient.
                  </ExplainerBlock>
                  <ExplainerBlock title="Feedback Retraining Loop">
                    Uncertain predictions are flagged and stored. You approve or reject each item here.
                    Approved images are merged into the live dataset, the backbone stays frozen for epoch 1,
                    and the updated model is hot-reloaded without restarting the server.
                  </ExplainerBlock>
                  <ExplainerBlock title="Confidence & Margin Gates">
                    Each prediction produces a softmax distribution. Two gates must both pass:
                    confidence ≥ {((data.settings?.prediction_confidence_threshold ?? 0.55) * 100).toFixed(0)}% and
                    the top-1 prediction must lead top-2 by ≥ {((data.settings?.prediction_margin_threshold ?? 0.12) * 100).toFixed(0)}%.
                    If either fails, the image is flagged as uncertain.
                  </ExplainerBlock>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pending feedback */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-base font-bold">Pending Feedback</h2>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {data.pending_count}
            </span>
          </div>

          {data.pending_items.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
              <CheckCircle2 className="mx-auto mb-4 size-12 text-green-400/60" />
              <h3 className="text-lg font-bold">All caught up!</h3>
              <p className="mt-2 max-w-sm mx-auto text-sm text-muted-foreground leading-relaxed">
                No feedback items are awaiting review. As users submit corrections to predictions, they will appear here for approval before being used in retraining.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {data.pending_items.map((item) => (
                  <FeedbackCard
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Retraining history */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-base font-bold">Retraining History</h2>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              last {history.length}
            </span>
            <button
              onClick={() => secret && fetchHistory(secret)}
              className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </button>
          </div>
          <RunHistoryPanel history={history} loading={historyLoading} />
        </div>

      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminAccessPage() {
  return (
    <Suspense>
      <AdminAccessInner />
    </Suspense>
  )
}
