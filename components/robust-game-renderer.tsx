"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Bug, AlertCircle } from "lucide-react"
import { loadGame, type LoadingState, type GameData } from "@/lib/game-loader"

interface RobustGameRendererProps {
  gameData: GameData
  onLog?: (message: string) => void
  onError?: (error: string) => void
  onLoaded?: () => void
  debug?: boolean
}

export default function RobustGameRenderer({
  gameData,
  onLog,
  onError,
  onLoaded,
  debug = false,
}: RobustGameRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [showDebugPanel, setShowDebugPanel] = useState(debug)
  const [loadAttempts, setLoadAttempts] = useState(0)

  // Helper function to log messages
  const log = (message: string) => {
    console.log(message)
    setLogs((prev) => [...prev, message])
    onLog?.(message)
  }

  // Effect to initialize the game
  useEffect(() => {
    if (!containerRef.current || !gameData) return

    // Reset state
    setLoadingState("loading")
    setError(null)

    log(`Starting game initialization (attempt ${loadAttempts + 1})`)

    // Load the game
    loadGame(gameData, containerRef.current, {
      debug: showDebugPanel,
      timeout: 10000, // 10 seconds timeout
      forceRender: loadAttempts > 0, // Force render on retry attempts
      mockThreeJs: loadAttempts > 0, // Use mock THREE.js on retry attempts
    })
      .then((result) => {
        // Add all logs from the loader
        result.logs.forEach(log)

        if (result.success) {
          setLoadingState("loaded")
          log(`Game loaded successfully${result.loadTime ? ` in ${result.loadTime.toFixed(2)}ms` : ""}`)
          onLoaded?.()
        } else {
          setLoadingState("error")
          setError(result.error || "Unknown error loading game")
          log(`Game loading failed: ${result.error}`)
          onError?.(result.error || "Unknown error loading game")
        }
      })
      .catch((err) => {
        setLoadingState("error")
        const errorMessage = err instanceof Error ? err.message : String(err)
        setError(errorMessage)
        log(`Error during game initialization: ${errorMessage}`)
        onError?.(errorMessage)
      })

    // Clean up function
    return () => {
      log("Cleaning up game resources")
      // Any cleanup needed
    }
  }, [gameData, refreshKey, loadAttempts, showDebugPanel])

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
    setLoadAttempts((prev) => prev + 1)
  }

  // Handle force show
  const handleForceShow = () => {
    setLoadingState("loaded")
    log("Forcing game to show regardless of loading state")
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      {loadingState === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 mb-2">Loading game resources...</p>
          <p className="text-xs text-gray-500 mb-4">This may take a few moments</p>

          {loadAttempts > 0 && (
            <Button onClick={handleForceShow} className="bg-purple-600 hover:bg-purple-700 text-white">
              Force Show Game
            </Button>
          )}
        </div>
      )}

      {/* Error overlay */}
      {loadingState === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 max-w-md">
            <h3 className="font-bold flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error Loading Game
            </h3>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} className="bg-purple-600 hover:bg-purple-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={handleForceShow} variant="outline" className="border-purple-500 text-purple-700">
              Force Show Game
            </Button>
          </div>

          {/* Debug information */}
          {showDebugPanel && (
            <div className="mt-4 w-full max-w-md bg-gray-100 p-4 rounded-md border border-gray-300">
              <h4 className="font-medium text-gray-700 mb-2">Debug Information</h4>
              <div className="bg-gray-800 text-gray-200 p-2 rounded text-xs font-mono h-32 overflow-auto">
                {logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game container */}
      <div
        ref={containerRef}
        id="game-container"
        className="w-full h-full bg-white"
        style={{
          position: "relative",
          overflow: "auto",
          zIndex: loadingState === "loaded" ? 5 : 1,
          visibility: loadingState === "loaded" ? "visible" : "hidden",
        }}
      ></div>

      {/* Debug toggle button */}
      <div className="absolute bottom-4 right-4 z-20">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className={`bg-white/80 border-gray-300 ${showDebugPanel ? "text-purple-700" : "text-gray-700"}`}
        >
          <Bug className="h-4 w-4 mr-2" />
          {showDebugPanel ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>
    </div>
  )
}
