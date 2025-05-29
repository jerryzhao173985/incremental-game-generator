"use client"

import { useEffect } from "react"
import { createThreeMock } from "@/lib/three-fallback"

export default function ThreeLoader() {
  useEffect(() => {
    // Check if THREE is already defined
    if (typeof window !== "undefined" && (window as any).THREE) {
      console.log("THREE.js already loaded")
      return
    }

    console.log("Loading THREE.js directly...")

    // Create a script element
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
    script.async = true
    script.crossOrigin = "anonymous"

    // Add event handlers
    script.onload = () => {
      console.log("THREE.js loaded successfully")
    }

    script.onerror = (e) => {
      console.error("Failed to load THREE.js", e)

      // Create a mock THREE object as fallback
      if (typeof window !== "undefined") {
        console.log("Creating THREE.js mock object")
        ;(window as any).THREE = createThreeMock()
      }
    }

    // Add to document
    document.head.appendChild(script)

    // Set a timeout to create a fallback if loading takes too long
    const timeout = setTimeout(() => {
      if (typeof window !== "undefined" && !(window as any).THREE) {
        console.warn("THREE.js loading timeout, creating fallback")
        ;(window as any).THREE = createThreeMock()
      }
    }, 5000)

    return () => {
      clearTimeout(timeout)
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return null
}
