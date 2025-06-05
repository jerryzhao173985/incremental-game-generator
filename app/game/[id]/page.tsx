"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Home, RefreshCw, Eye, Code, Play, FileText } from "lucide-react"
import { decompressFromEncodedURIComponent } from "lz-string"
import Script from "next/script"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"

// Simple syntax highlighting component
function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <pre className={`language-${language} overflow-auto p-4 bg-gray-900 text-gray-100 rounded-md`}>
      <code>{code}</code>
    </pre>
  )
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [gameData, setGameData] = useState<{
    html: string
    css: string
    js: string
    title: string
    description?: string
    md?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)
  const [threeJsLoaded, setThreeJsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("game")
  const [gameLoaded, setGameLoaded] = useState(false)
  const [gameError, setGameError] = useState<string | null>(null)

  useEffect(() => {
    // Get the game ID from the URL
    const gameId = params.id as string
    console.log("Loading game with ID:", gameId)

    // First try to get the game data from the URL
    const gameDataParam = searchParams.get("data")
    if (gameDataParam) {
      try {
        // Decode compressed game data
        const decodedData = decompressFromEncodedURIComponent(gameDataParam)
        const parsedData = JSON.parse(decodedData || "{}")

        console.log("Game data found in URL parameters")
        setGameData(parsedData)
        document.title = `${parsedData.title} - Incremental Game Generator`
        setLoading(false)
        return
      } catch (err) {
        console.error("Error parsing game data from URL:", err)
        // Continue to try localStorage as fallback
      }
    }

    // If no data in URL or parsing failed, try localStorage
    try {
      const storedGames = localStorage.getItem("generatedGames")
      console.log("Found stored games:", storedGames ? "Yes" : "No")

      if (storedGames) {
        const games = JSON.parse(storedGames)
        console.log("Number of games found:", games.length)

        // Debug: Log all game IDs to help diagnose the issue
        console.log(
          "Available game IDs:",
          games.map((g: any) => g.id),
        )

        const game = games.find((g: any) => g.id === gameId)

        if (game) {
          console.log("Game found in localStorage:", game.title)
          setGameData(game)
          document.title = `${game.title} - Incremental Game Generator`
        } else {
          console.error("Game not found with ID:", gameId)
          setError(`Game not found with ID: ${gameId}. Please go back and try again.`)
        }
      } else {
        console.error("No games found in localStorage")
        setError("No games found. Please go back and generate a game first.")
      }
    } catch (err) {
      console.error("Error loading game:", err)
      setError(`Failed to load game data: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }, [params.id, searchParams])

  // Inject the game code into the page
  useEffect(() => {
    if (!gameData || !threeJsLoaded || activeTab !== "game") return

    // Reset game state
    setGameLoaded(false)
    setGameError(null)

    // Create the game container
    const gameContainer = document.getElementById("game-container")
    if (!gameContainer) {
      console.error("Game container not found")
      setGameError("Game container not found")
      return
    }

    // Clear any existing content
    gameContainer.innerHTML = ""

    // Add the HTML content
    gameContainer.innerHTML = gameData.html

    // Add the CSS
    const styleElement = document.createElement("style")
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
      #debug-panel {
        position: fixed;
        top: 0;
        right: 0;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 5px;
        font-family: monospace;
        font-size: 10px;
        z-index: 9999;
        max-width: 300px;
        max-height: 200px;
        overflow: auto;
      }
      * {
        box-sizing: border-box;
      }
      ${gameData.css}
    `
    document.head.appendChild(styleElement)

    // Set up console log capture
    const debugPanel = document.getElementById("debug-panel")
    if (debugPanel) {
      const originalConsoleLog = console.log
      console.log = (...args) => {
        originalConsoleLog.apply(console, args)
        const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")

        setLogs((prev) => [...prev, message])

        debugPanel.innerHTML += message + "<br>"
        debugPanel.style.display = showDebug ? "block" : "none"
      }
    }

    // Add error handler
    window.onerror = (message, source, lineno, colno, error) => {
      console.log("Game error:", message, "at", source, lineno, colno)
      setGameError(`${message} at line ${lineno}`)

      // Display error in the page
      const errorDisplay = document.createElement("div")
      errorDisplay.id = "error-display"
      errorDisplay.textContent = "Error: " + message
      document.body.appendChild(errorDisplay)

      return false
    }

    // Add the JavaScript with proper DOMContentLoaded handling
    try {
      const scriptElement = document.createElement("script")

      // Check if the game code uses THREE.js and add a fallback if needed
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
          window.parent.postMessage({ type: 'gameLoaded' }, '*');
          
          // Also dispatch a custom event
          try {
            const event = new CustomEvent('gameLoaded');
            document.dispatchEvent(event);
          } catch (e) {
            console.error('Error dispatching gameLoaded event:', e);
          }
        }
        
        ${gameData.js}
        
        // Signal game loaded after a short delay to ensure rendering is complete
        setTimeout(signalGameLoaded, 500);
      `

      // Check if the JS already has a DOMContentLoaded listener
      if (modifiedJs.includes("DOMContentLoaded")) {
        scriptElement.textContent = `
          console.log('Game script loaded, executing...');
          ${modifiedJs}
          console.log('Game script execution completed');
        `
      } else {
        // Wrap the code in a DOMContentLoaded listener
        scriptElement.textContent = `
          console.log('Game script loaded, waiting for DOMContentLoaded...');
          document.addEventListener('DOMContentLoaded', function() {
            try {
              console.log('DOMContentLoaded fired, running game code...');
              ${modifiedJs}
              console.log('Game initialization complete');
            } catch (e) {
              console.log('Error during game initialization:', e.message);
              var errorDisplay = document.createElement('div');
              errorDisplay.id = 'error-display';
              errorDisplay.textContent = 'Error: ' + e.message;
              document.body.appendChild(errorDisplay);
              
              // Signal error to parent
              window.parent.postMessage({ 
                type: 'gameError', 
                error: e.message 
              }, '*');
            }
          });
        `
      }

      document.body.appendChild(scriptElement)

      // Listen for the gameLoaded event
      document.addEventListener("gameLoaded", () => {
        console.log("Game loaded event received")
        setGameLoaded(true)
      })

      // Set a timeout to mark the game as loaded even if the event doesn't fire
      const loadTimeout = setTimeout(() => {
        if (!gameLoaded) {
          console.log("Game load timeout reached, assuming game is loaded")
          setGameLoaded(true)
        }
      }, 3000)

      // Dispatch DOMContentLoaded manually if it might have already fired
      if (document.readyState === "complete" || document.readyState === "interactive") {
        console.log("Document already loaded, dispatching DOMContentLoaded manually")
        setTimeout(() => {
          const event = new Event("DOMContentLoaded")
          document.dispatchEvent(event)
        }, 100)
      }

      return () => {
        clearTimeout(loadTimeout)
      }
    } catch (err) {
      console.error("Error executing game code:", err)
      setGameError(`Error executing game code: ${err instanceof Error ? err.message : String(err)}`)
    }

    return () => {
      // Cleanup
      if (styleElement.parentNode) {
        document.head.removeChild(styleElement)
      }
      // Reset console.log
      if (typeof window !== "undefined") {
        console.log = console.log.__proto__.log || console.log
      }
    }
  }, [gameData, showDebug, threeJsLoaded, activeTab])

  // Listen for messages from the game
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "gameLoaded") {
        console.log("Game loaded message received")
        setGameLoaded(true)
      } else if (event.data.type === "gameError") {
        console.error("Game error message received:", event.data.error)
        setGameError(event.data.error)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
              <p className="text-gray-700 mb-6">{error}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Go Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </button>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Troubleshooting Tips</h3>
            <ul className="text-xs text-yellow-700 list-disc pl-4 space-y-1">
              <li>Make sure you're not in incognito/private browsing mode</li>
              <li>Try going back to the main page and clicking "Open in New Tab" again</li>
              <li>Check if localStorage is enabled in your browser</li>
              <li>Try refreshing the main page before opening in a new tab</li>
              <li>Check browser console for any JavaScript errors</li>
              <li>Try clearing your browser cache and reloading the page</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Load THREE.js library */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        onLoad={() => {
          console.log("THREE.js loaded successfully")
          setThreeJsLoaded(true)
        }}
        onError={() => {
          console.error("Failed to load THREE.js")
          // Continue anyway with the mock object
          setThreeJsLoaded(true)
        }}
      />

      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header with game title and controls */}
        <header className="bg-purple-900 text-white p-4 shadow-md">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl font-bold">{gameData?.title || "Game"}</h1>
              <p className="text-sm text-purple-200">{gameData?.description || "Interactive Game"}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-700/30 text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Generator
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-700/30 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload
              </Button>
            </div>
          </div>
        </header>

        {/* Main content with tabs */}
        <main className="flex-grow container mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-purple-950/50 w-full justify-start mb-4">
              <TabsTrigger value="game" className="flex items-center">
                <Play className="h-4 w-4 mr-2" />
                Game
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Logs
              </TabsTrigger>
              {gameData?.md && (
                <TabsTrigger value="docs" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Documentation
                </TabsTrigger>
              )}
            </TabsList>

            {/* Game Tab */}
            <TabsContent value="game" className="m-0">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg relative" style={{ height: "80vh" }}>
                {!threeJsLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">Loading game resources...</p>
                  </div>
                )}

                {threeJsLoaded && !gameLoaded && !gameError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">Initializing game...</p>
                  </div>
                )}

                {gameError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-4">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 max-w-md">
                      <h3 className="font-bold">Error Loading Game</h3>
                      <p className="text-sm">{gameError}</p>
                    </div>
                    <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                )}

                <div id="game-container" className="w-full h-full"></div>

                {/* Debug panel */}
                <div
                  id="debug-panel"
                  className="fixed top-0 right-0 bg-black/70 text-white p-2 font-mono text-xs max-w-xs max-h-48 overflow-auto z-50"
                  style={{ display: showDebug ? "block" : "none" }}
                ></div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setShowDebug(!showDebug)}
                  variant="outline"
                  className={`border-purple-500/50 hover:bg-purple-700/30 ${showDebug ? "bg-purple-700/30" : ""}`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showDebug ? "Hide Debug Panel" : "Show Debug Panel"}
                </Button>
              </div>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="m-0">
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="bg-gray-800 w-full justify-start mb-4">
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="js">JavaScript</TabsTrigger>
                </TabsList>

                <TabsContent value="html" className="m-0">
                  <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg" style={{ maxHeight: "70vh" }}>
                    <CodeBlock code={gameData?.html || ""} language="html" />
                  </div>
                </TabsContent>

                <TabsContent value="css" className="m-0">
                  <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg" style={{ maxHeight: "70vh" }}>
                    <CodeBlock code={gameData?.css || ""} language="css" />
                  </div>
                </TabsContent>

                <TabsContent value="js" className="m-0">
                  <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg" style={{ maxHeight: "70vh" }}>
                    <CodeBlock code={gameData?.js || ""} language="javascript" />
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="m-0">
              <div className="bg-gray-900 p-4 overflow-auto rounded-lg shadow-lg" style={{ height: "70vh" }}>
                <div className="font-mono text-sm text-gray-300">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="py-1 border-b border-gray-800">
                        {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No logs available. Run the game to see console output here.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Documentation Tab */}
            {gameData?.md && (
              <TabsContent value="docs" className="m-0">
                <div className="bg-white p-6 rounded-lg shadow-lg overflow-auto" style={{ height: "70vh" }}>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{gameData.md}</ReactMarkdown>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-300 p-4 text-center text-sm">
          <p>Incremental Game Generator - Built with Next.js and OpenAI</p>
        </footer>
      </div>
    </>
  )
}
