"use client"

import { useEffect, useState } from "react"

interface DirectScriptLoaderProps {
  src: string
  onLoad?: () => void
  onError?: (error: string) => void
  fallbackSrc?: string
  timeout?: number
  id?: string
  async?: boolean
  defer?: boolean
  crossOrigin?: string
}

export default function DirectScriptLoader({
  src,
  onLoad,
  onError,
  fallbackSrc,
  timeout = 5000,
  id,
  async = true,
  defer = false,
  crossOrigin,
}: DirectScriptLoaderProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)

  useEffect(() => {
    // Check if script is already loaded
    if (id && document.getElementById(id)) {
      console.log(`Script with id ${id} already exists, not loading again`)
      setLoaded(true)
      onLoad?.()
      return () => {}
    }

    // Create script element
    const script = document.createElement("script")
    script.src = src
    script.async = async
    script.defer = defer
    if (id) script.id = id
    if (crossOrigin) script.crossOrigin = crossOrigin

    // Set up event handlers
    script.onload = () => {
      console.log(`Script loaded: ${src}`)
      setLoaded(true)
      onLoad?.()
    }

    script.onerror = (e) => {
      console.error(`Failed to load script: ${src}`, e)
      setError(`Failed to load script: ${src}`)

      // Try fallback if available
      if (fallbackSrc && !usedFallback) {
        console.log(`Trying fallback script: ${fallbackSrc}`)
        setUsedFallback(true)

        const fallbackScript = document.createElement("script")
        fallbackScript.src = fallbackSrc
        fallbackScript.async = async
        fallbackScript.defer = defer
        if (id) fallbackScript.id = id
        if (crossOrigin) fallbackScript.crossOrigin = crossOrigin

        fallbackScript.onload = () => {
          console.log(`Fallback script loaded: ${fallbackSrc}`)
          setLoaded(true)
          onLoad?.()
        }

        fallbackScript.onerror = (e) => {
          console.error(`Failed to load fallback script: ${fallbackSrc}`, e)
          setError(`Failed to load both primary and fallback scripts`)
          onError?.(`Failed to load both primary and fallback scripts`)
        }

        document.head.appendChild(fallbackScript)
      } else {
        onError?.(`Failed to load script: ${src}`)
      }
    }

    // Add to document
    document.head.appendChild(script)

    // Set a timeout
    const timeoutId = setTimeout(() => {
      if (!loaded && !error) {
        console.warn(`Script loading timeout: ${src}`)
        setError(`Timeout loading script: ${src}`)
        onError?.(`Timeout loading script: ${src}`)
      }
    }, timeout)

    // Cleanup function
    return () => {
      clearTimeout(timeoutId)
      // Don't remove the script on cleanup as it might be needed by the app
    }
  }, [src, fallbackSrc, onLoad, onError, timeout, id, async, defer, crossOrigin, usedFallback, loaded, error])

  return null
}
