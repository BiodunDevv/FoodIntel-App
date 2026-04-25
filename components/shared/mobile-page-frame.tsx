import { cn } from "@/lib/utils"

interface MobilePageFrameProps {
  children: React.ReactNode
  className?: string
}

export function MobilePageFrame({ children, className }: MobilePageFrameProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>
}
