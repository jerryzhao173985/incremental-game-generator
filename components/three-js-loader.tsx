"use client"

import { useEffect, useState } from "react"
import { createThreeMock } from "@/lib/three-fallback"

interface ThreeJsLoaderProps {
  onLoad: () => void
  onError: (error: string) => void
}

export default function ThreeJsLoader({ onLoad, onError }: ThreeJsLoaderProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if THREE is already defined
    if (typeof window !== "undefined" && (window as any).THREE) {
      console.log("THREE.js already loaded")
      setLoaded(true)
      onLoad()
      return
    }

    // Create a script element to load THREE.js
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
    script.async = true

    script.onload = () => {
      console.log("THREE.js loaded successfully")
      setLoaded(true)
      onLoad()
    }

    script.onerror = (e) => {
      console.error("Failed to load THREE.js", e)
      setError("Failed to load THREE.js library")
      onError("Failed to load THREE.js library")

      // Create a mock THREE object as fallback
      if (typeof window !== "undefined") {
        ;(window as any).THREE = createThreeMock()

        // Call onLoad with the mock object
        onLoad()
      }
    }

    document.head.appendChild(script)

    // Set a timeout to create a fallback if loading takes too long
    const timeout = setTimeout(() => {
      if (!loaded && !error) {
        console.warn("THREE.js loading timeout, creating fallback")
        if (typeof window !== "undefined" && !(window as any).THREE) {
          ;(window as any).THREE = createThreeMock()
          onLoad()
        }
      }
    }, 5000)

    return () => {
      // Clean up
      clearTimeout(timeout)
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [onLoad, onError, loaded, error])

  return null
}
