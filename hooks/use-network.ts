import { useState, useEffect } from "react"

export type ConnectionType =
  | "wifi"
  | "cellular"
  | "ethernet"
  | "none"
  | "unknown"

export function useNetworkStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  )
  const [type, setType] = useState<ConnectionType>("unknown")

  useEffect(() => {
    function updateOnline() {
      setOnline(navigator.onLine)
    }

    window.addEventListener("online", updateOnline)
    window.addEventListener("offline", updateOnline)
    updateOnline()

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    function updateConnection() {
      if (!connection) return
      const cType: string = connection.type || connection.effectiveType
      if (cType.includes("wifi")) setType("wifi")
      else if (cType.includes("ethernet")) setType("ethernet")
      else if (cType.includes("cellular") || /\dg/.test(cType)) setType("cellular")
      else if (cType === "none") setType("none")
      else setType("unknown")
    }

    if (connection) {
      connection.addEventListener("change", updateConnection)
      updateConnection()
    }

    return () => {
      window.removeEventListener("online", updateOnline)
      window.removeEventListener("offline", updateOnline)
      if (connection) connection.removeEventListener("change", updateConnection)
    }
  }, [])

  return { online, type }
}

export function getNetworkQuality(type: ConnectionType) {
  switch (type) {
    case "none":
      return "none"
    case "cellular":
      return "low"
    case "wifi":
    case "ethernet":
      return "high"
    default:
      return "unknown"
  }
}
