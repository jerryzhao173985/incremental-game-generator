"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { createThreeMock } from "@/lib/three-fallback"

interface GameRendererProps {
  gameData: {
    html: string
    css: string
    js: string
    title?: string
  }
  onLog?: (message: string) => void
  onError?: (error: string) => void
  onLoaded?: () => void
}

export default function GameRenderer({ gameData, onLog, onError, onLoaded }: GameRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Helper function to log messages
  const log = (message: string) => {
    console.log(message)
    onLog?.(message)
  }

  // Helper function to handle errors
  const handleError = (err: string) => {
    console.error(err)
    setError(err)
    onError?.(err)
  }

  // Effect to initialize the game
  useEffect(() => {
    if (!containerRef.current) return

    // Reset state
    setLoaded(false)
    setError(null)

    // Clear container
    containerRef.current.innerHTML = ""

    try {
      // Add the HTML content
      containerRef.current.innerHTML = gameData.html

      // Add the CSS
      const styleElement = document.createElement("style")
      styleElement.textContent = `
        ${gameData.css}
      `
      document.head.appendChild(styleElement)

      // Ensure THREE.js is available
      if (typeof window !== "undefined" && !(window as any).THREE) {
        log("THREE.js not found, creating mock object")
        ;(window as any).THREE = createThreeMock()
      }

      // Add the JavaScript
      const scriptElement = document.createElement("script")
      scriptElement.textContent = `
        try {
          // Signal that the game is loaded
          function signalGameLoaded() {
            console.log('Game loaded successfully');
            document.dispatchEvent(new CustomEvent('gameLoaded'));
          }
          
          // Execute the game code
          ${gameData.js}
          
          // Signal game loaded after a short delay
          setTimeout(signalGameLoaded, 500);
        } catch (e) {
          console.error('Error executing game code:', e);
          document.dispatchEvent(new CustomEvent('gameError', { 
            detail: { message: e.message } 
          }));
        }
      `
      document.body.appendChild(scriptElement)

      // Listen for game loaded event
      const loadedHandler = () => {
        log("Game loaded event received")
        setLoaded(true)
        onLoaded?.()
      }
      document.addEventListener("gameLoaded", loadedHandler)

      // Listen for game error event
      const errorHandler = (e: any) => {
        const errorMessage = e.detail?.message || "Unknown error"
        handleError(`Game error: ${errorMessage}`)
      }
      document.addEventListener("gameError", errorHandler)

      // Set a timeout to force-show the game
      const timeout = setTimeout(() => {
        if (!loaded && !error) {
          log("Loading timeout reached, forcing game to show")
          setLoaded(true)
          onLoaded?.()
        }
      }, 5000)

      return () => {
        // Clean up
        document.removeEventListener("gameLoaded", loadedHandler)
        document.removeEventListener("gameError", errorHandler)
        clearTimeout(timeout)
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement)
        }
        if (scriptElement.parentNode) {
          scriptElement.parentNode.removeChild(scriptElement)
        }
      }
    } catch (err) {
      handleError(`Error initializing game: ${err instanceof Error ? err.message : String(err)}`)
    }
  }, [gameData, refreshKey])

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
          <button
            onClick={() => setLoaded(true)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Force Show Game
          </button>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 max-w-md">
            <h3 className="font-bold">Error Loading Game</h3>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={handleRefresh} className="bg-purple-600 hover:bg-purple-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Game container */}
      <div
        ref={containerRef}
        className="w-full h-full bg-white"
        style={{
          position: "relative",
          overflow: "auto",
          zIndex: 1,
          visibility: loaded ? "visible" : "hidden",
        }}
      ></div>
    </div>
  )
}
