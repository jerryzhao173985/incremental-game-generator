"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Bug, AlertCircle } from "lucide-react"
import DirectScriptLoader from "./direct-script-loader"
import GameDebugPanel from "./game-debug-panel"
import { createThreeMock } from "@/lib/game-loader"

interface SuperRobustGameRendererProps {
  html: string
  css: string
  js: string
  title?: string
  id?: string
  onLog?: (message: string) => void
  onError?: (error: string) => void
  onLoaded?: () => void
  debug?: boolean
}

export default function SuperRobustGameRenderer({
  html,
  css,
  js,
  title,
  id,
  onLog,
  onError,
  onLoaded,
  debug = false,
}: SuperRobustGameRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [threeJsLoaded, setThreeJsLoaded] = useState(false)
  const [gameLoaded, setGameLoaded] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(debug)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loadAttempts, setLoadAttempts] = useState(0)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)

  // Helper function to log messages
  const log = (message: string) => {
    console.log(message)
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
    onLog?.(message)
  }

  // Handle errors
  const handleError = (errorMessage: string) => {
    console.error(errorMessage)
    setError(errorMessage)
    onError?.(errorMessage)
  }

  // Handle THREE.js loading
  const handleThreeJsLoaded = () => {
    log("THREE.js loaded successfully")
    setThreeJsLoaded(true)
  }

  // Handle THREE.js loading error
  const handleThreeJsError = (errorMessage: string) => {
    log(`THREE.js loading error: ${errorMessage}`)

    // Create a mock THREE object as fallback
    if (typeof window !== "undefined") {
      log("Creating THREE.js mock object as fallback")
      ;(window as any).THREE = createThreeMock()
      setThreeJsLoaded(true)
    }
  }

  // Clean up resources
  const cleanupResources = () => {
    // Remove script element
    if (scriptRef.current && scriptRef.current.parentNode) {
      scriptRef.current.parentNode.removeChild(scriptRef.current)
      scriptRef.current = null
    }

    // Remove style element
    if (styleRef.current && styleRef.current.parentNode) {
      styleRef.current.parentNode.removeChild(styleRef.current)
      styleRef.current = null
    }
  }

  // Effect to initialize the game when THREE.js is loaded
  useEffect(() => {
    if (!threeJsLoaded || !containerRef.current) return

    // Clean up any existing resources
    cleanupResources()

    log(`Initializing game (attempt ${loadAttempts + 1})`)

    try {
      // Clear any existing content
      containerRef.current.innerHTML = ""

      // Add the HTML content
      log("Adding HTML content")
      containerRef.current.innerHTML = html

      // Add the CSS
      log("Adding CSS styles")
      const styleElement = document.createElement("style")
      styleRef.current = styleElement
      styleElement.textContent = `
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: 'Arial', sans-serif;
          background-color: white;
        }
        #game-container {
          width: 100%;
          height: 100%;
          overflow: auto;
          position: relative;
          background-color: white;
          color: black;
          z-index: 5;
        }
        #error-display {
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: rgba(255,0,0,0.8);
          color: white;
          padding: 10px;
          border-radius: 5px;
          font-family: monospace;
          z-index: 9999;
          max-width: 80%;
          word-break: break-word;
        }
        * {
          box-sizing: border-box;
        }
        ${css}
      `
      document.head.appendChild(styleElement)

      // Add error handler
      log("Setting up error handler")
      const originalOnError = window.onerror
      window.onerror = (message, source, lineno, colno, error) => {
        log(`Game error: ${message} at ${source}:${lineno}:${colno}`)

        // Display error in the page
        const errorDisplay = document.createElement("div")
        errorDisplay.id = "error-display"
        errorDisplay.textContent = "Error: " + message
        document.body.appendChild(errorDisplay)

        return false
      }

      // Add the JavaScript with proper initialization
      log("Adding JavaScript code")
      const scriptElement = document.createElement("script")
      scriptRef.current = scriptElement

      // Prepare the JavaScript code with proper initialization
      const modifiedJs = `
        // Check if THREE is available, if not, provide a mock object
        if (typeof THREE === 'undefined') {
          console.log('THREE.js not found, creating mock object');
          window.THREE = {
            Scene: function() { return { add: function() {} } },
            PerspectiveCamera: function() { return {} },
            WebGLRenderer: function() { return { 
              setSize: function() {}, 
              render: function() {},
              domElement: document.createElement('div')
            } },
            BoxGeometry: function() { return {} },
            MeshBasicMaterial: function() { return {} },
            Mesh: function() { return {} },
            Vector3: function() { return {} },
            Clock: function() { return { getElapsedTime: function() { return 0; } } }
          };
        }
        
        // Signal that the game is loaded
        function signalGameLoaded() {
          console.log('Game loaded successfully');
          try {
            const event = new CustomEvent('gameLoaded');
            document.dispatchEvent(event);
          } catch (e) {
            console.error('Error dispatching gameLoaded event:', e);
          }
        }
        
        // Signal game error
        function signalGameError(error) {
          console.error('Game error:', error);
          try {
            const event = new CustomEvent('gameError', { 
              detail: { message: error.message || error }
            });
            document.dispatchEvent(event);
          } catch (e) {
            console.error('Error dispatching gameError event:', e);
          }
        }
        
        // Execute the game code
        try {
          ${js}
          
          // Signal game loaded after a short delay to ensure rendering is complete
          setTimeout(signalGameLoaded, 500);
        } catch (e) {
          console.error('Error executing game code:', e);
          signalGameError(e);
        }
      `

      scriptElement.textContent = modifiedJs
      document.body.appendChild(scriptElement)

      // Listen for the gameLoaded event
      const loadedHandler = () => {
        log("Game loaded event received")
        setGameLoaded(true)
        setLoading(false)
        onLoaded?.()
      }

      // Listen for the gameError event
      const errorHandler = (e: any) => {
        const errorMessage = e.detail?.message || "Unknown error"
        log(`Game error event received: ${errorMessage}`)
        setError(errorMessage)
        setLoading(false)
      }

      document.addEventListener("gameLoaded", loadedHandler)
      document.addEventListener("gameError", errorHandler)

      // Set a timeout to force-show the game after a delay
      const timeout = setTimeout(() => {
        if (loading) {
          log("Loading timeout reached, forcing game to show")
          setGameLoaded(true)
          setLoading(false)
          onLoaded?.()
        }
      }, 5000)

      return () => {
        // Clean up
        document.removeEventListener("gameLoaded", loadedHandler)
        document.removeEventListener("gameError", errorHandler)
        clearTimeout(timeout)
        window.onerror = originalOnError
        cleanupResources()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      log(`Error initializing game: ${errorMessage}`)
      handleError(`Error initializing game: ${errorMessage}`)
      setLoading(false)
    }
  }, [threeJsLoaded, html, css, js, refreshKey, loadAttempts])

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
    setLoadAttempts((prev) => prev + 1)
    setLoading(true)
    setError(null)
    setGameLoaded(false)
    cleanupResources()
  }

  // Handle force show
  const handleForceShow = () => {
    setLoading(false)
    setGameLoaded(true)
    log("Forcing game to show regardless of loading state")
    onLoaded?.()
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupResources()
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* THREE.js loader */}
      <DirectScriptLoader
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        fallbackSrc="https://threejs.org/build/three.min.js"
        id="three-js-script"
        onLoad={handleThreeJsLoaded}
        onError={handleThreeJsError}
        crossOrigin="anonymous"
      />

      {/* Loading overlay */}
      {loading && (
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
      {error && !gameLoaded && (
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
          zIndex: gameLoaded ? 5 : 1,
          visibility: gameLoaded ? "visible" : "hidden",
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

      {/* Debug panel */}
      {showDebugPanel && (
        <GameDebugPanel logs={logs} onClose={() => setShowDebugPanel(false)} onRefresh={handleRefresh} gameId={id} />
      )}
    </div>
  )
}
