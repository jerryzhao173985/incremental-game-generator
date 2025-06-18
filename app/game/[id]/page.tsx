"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Home, RefreshCw, Eye, Code, Play, FileText, Gamepad, ArrowLeft } from "lucide-react"
import Script from "next/script"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"

// Simple syntax highlighting component
function CodeBlock({ code, language }: { code: string; language: string }) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      // You could add a toast notification here if desired
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 flex items-center space-x-2">
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
          {language.toUpperCase()}
        </span>
        <button
          className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 focus:outline-none transition-colors"
          onClick={copyToClipboard}
        >
          Copy
        </button>
      </div>
      <pre className={`language-${language} overflow-auto p-6 bg-gray-900 text-gray-100 rounded-xl border border-gray-700`}>
        <code className="text-sm leading-relaxed">{code}</code>
      </pre>
    </div>
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
        // Decode the base64 game data
        const decodedData = decodeURIComponent(atob(gameDataParam))
        const parsedData = JSON.parse(decodedData)

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-purple-400/30">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Your Game</h2>
          <p className="text-purple-200">Setting up the gaming environment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 to-purple-900 p-4">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-red-400/30">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-red-500/20 p-3 rounded-xl">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-red-300 mb-3">Game Not Found</h1>
              <p className="text-red-200/90 leading-relaxed mb-6">{error}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.back()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1 border-red-400/50 text-red-200 hover:bg-red-500/20"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-xl">
            <h3 className="text-lg font-semibold text-yellow-300 mb-3">Troubleshooting Tips</h3>
            <ul className="text-sm text-yellow-200/90 space-y-2 leading-relaxed">
              <li>• Make sure you're not in incognito/private browsing mode</li>
              <li>• Try going back to the main page and clicking "Open in New Tab" again</li>
              <li>• Check if localStorage is enabled in your browser</li>
              <li>• Try refreshing the main page before opening in a new tab</li>
              <li>• Clear your browser cache and reload the page</li>
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

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex flex-col">
        {/* Enhanced Header */}
        <header className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white p-6 shadow-xl border-b border-purple-500/30">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-2">
                  <div className="bg-purple-500/20 p-2 rounded-xl mr-3">
                    <Gamepad className="h-6 w-6 text-purple-300" />
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">{gameData?.title || "Game"}</h1>
                </div>
                <p className="text-base text-purple-200/90 max-w-2xl leading-relaxed">
                  {gameData?.description || "Interactive Game Experience"}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-purple-400/50 hover:bg-purple-700/30 text-white transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Generator
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-purple-400/50 hover:bg-purple-700/30 text-white transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content with enhanced tabs */}
        <main className="flex-grow container mx-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-6">
              <TabsList className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-md w-full justify-start border border-purple-500/30">
                <TabsTrigger 
                  value="game" 
                  className="flex items-center data-[state=active]:bg-purple-600/50 data-[state=active]:text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Game
                </TabsTrigger>
                <TabsTrigger 
                  value="code" 
                  className="flex items-center data-[state=active]:bg-purple-600/50 data-[state=active]:text-white"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger 
                  value="logs" 
                  className="flex items-center data-[state=active]:bg-purple-600/50 data-[state=active]:text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Logs
                </TabsTrigger>
                {gameData?.md && (
                  <TabsTrigger 
                    value="docs" 
                    className="flex items-center data-[state=active]:bg-purple-600/50 data-[state=active]:text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Documentation
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Game Tab */}
            <TabsContent value="game" className="m-0">
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl relative border border-gray-200" style={{ height: "80vh" }}>
                {!threeJsLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 z-10">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-6"></div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Game Resources</h3>
                    <p className="text-gray-600">Setting up the gaming environment...</p>
                  </div>
                )}

                {threeJsLoaded && !gameLoaded && !gameError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 z-10">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Initializing Game</h3>
                    <p className="text-gray-600">Starting your game experience...</p>
                  </div>
                )}

                {gameError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 z-10 p-6">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 mb-6 max-w-md rounded-lg shadow-lg">
                      <h3 className="font-bold text-lg mb-2">Error Loading Game</h3>
                      <p className="text-sm">{gameError}</p>
                    </div>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Loading
                    </Button>
                  </div>
                )}

                <div id="game-container" className="w-full h-full"></div>

                {/* Debug panel */}
                <div
                  id="debug-panel"
                  className="fixed top-0 right-0 bg-black/80 text-white p-3 font-mono text-xs max-w-xs max-h-48 overflow-auto z-50 rounded-bl-lg"
                  style={{ display: showDebug ? "block" : "none" }}
                ></div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowDebug(!showDebug)}
                  variant="outline"
                  className={`border-purple-500/50 hover:bg-purple-700/30 text-white transition-all duration-200 ${showDebug ? "bg-purple-700/30" : ""}`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showDebug ? "Hide Debug Panel" : "Show Debug Panel"}
                </Button>
              </div>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="m-0">
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="bg-gray-800/90 backdrop-blur-md w-full justify-start mb-6 border border-gray-700">
                  <TabsTrigger value="html" className="data-[state=active]:bg-orange-600/70">HTML</TabsTrigger>
                  <TabsTrigger value="css" className="data-[state=active]:bg-blue-600/70">CSS</TabsTrigger>
                  <TabsTrigger value="js" className="data-[state=active]:bg-yellow-600/70">JavaScript</TabsTrigger>
                </TabsList>

                <TabsContent value="html" className="m-0">
                  <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "70vh" }}>
                    <CodeBlock code={gameData?.html || ""} language="html" />
                  </div>
                </TabsContent>

                <TabsContent value="css" className="m-0">
                  <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "70vh" }}>
                    <CodeBlock code={gameData?.css || ""} language="css" />
                  </div>
                </TabsContent>

                <TabsContent value="js" className="m-0">
                  <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "70vh" }}>
                    <CodeBlock code={gameData?.js || ""} language="javascript" />
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="m-0">
              <div className="bg-gray-900 p-6 overflow-auto rounded-2xl shadow-2xl border border-gray-700" style={{ height: "70vh" }}>
                <div className="font-mono text-sm text-gray-300">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="py-2 border-b border-gray-800 hover:bg-gray-800/50 px-2 rounded">
                        <span className="text-gray-500 mr-3">{index + 1}.</span>
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Eye className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-500 italic text-lg">No logs available yet</p>
                      <p className="text-gray-600 text-sm mt-2">Run the game to see console output here</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Documentation Tab */}
            {gameData?.md && (
              <TabsContent value="docs" className="m-0">
                <div className="bg-white p-8 rounded-2xl shadow-2xl overflow-auto border border-gray-200" style={{ height: "70vh" }}>
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown>{gameData.md}</ReactMarkdown>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </main>

        {/* Enhanced Footer */}
        <footer className="bg-gradient-to-r from-gray-800 via-purple-800 to-gray-800 text-gray-300 p-6 text-center border-t border-purple-500/30">
          <div className="space-y-2">
            <p className="text-base font-medium">Incremental Game Generator</p>
            <p className="text-sm text-gray-400">Built with Next.js and OpenAI • Powered by GPT-4o</p>
          </div>
        </footer>
      </div>
    </>
  )
}