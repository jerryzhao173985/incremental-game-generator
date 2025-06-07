"use client"

import { cn } from "@/lib/utils"
import { useNetworkStatus } from "@/hooks/use-network"

interface NetworkIndicatorProps {
  className?: string
}

export default function NetworkIndicator({ className }: NetworkIndicatorProps) {
  const { online, type } = useNetworkStatus()

  const label = online ? `Connected (${type})` : "Offline"
  const color = online ? "text-green-400" : "text-red-400"

  return <div className={cn("text-xs", color, className)}>{label}</div>
}
