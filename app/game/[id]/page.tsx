"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AlertCircle, Home, RefreshCw, Eye, Code, Play, FileText, Bug } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import EnhancedCodeViewer from "@/components/enhanced-code-viewer-simple"
import { Suspense } from "react"
import Link from "next/link"
import { getGameFromStorage } from "@/lib/game-storage"
import DirectGameRenderer from "./direct-game-renderer"
import { safeGetItem, safeParse } from "@/lib/utils/storage-utils"

// Add TypeScript interface for window with gameData
declare global {
  interface Window {
    gameData?: any
    latestGameData?: any
  }
}

export default function GamePage() {
  const params = useParams()
  const [gameData, setGameData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("game")
  const [dataSource, setDataSource] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [gameError, setGameError] = useState<string | null>(null)
  const [gameLoaded, setGameLoaded] = useState(false)

  // Helper function to add logs
  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  // Load the game data
  useEffect(() => {
    // Get the game ID from the URL
    const gameId = params?.id as string
    if (!gameId) {
      setError("No game ID provided")
      setLoading(false)
      return
    }

    console.log("Loading game with ID:", gameId)
    addLog(`Loading game with ID: ${gameId}`)

    // Try multiple methods to get the game data
    let foundGame = false

    // Method 1: Check if the game data was passed directly via window object
    if (typeof window !== "undefined" && window.gameData) {
      console.log("Found game data in window.gameData")
      addLog("Found game data in window.gameData")
      setGameData(window.gameData)
      document.title = `${window.gameData.title} - Incremental Game Generator`
      setDataSource("window.gameData")
      foundGame = true
    }

    // Method 2: Use our utility function to get the game
    if (!foundGame) {
      const game = getGameFromStorage(gameId)
      if (game) {
        console.log("Found game using utility function")
        addLog("Found game using utility function")
        setGameData(game)
        document.title = `${game.title} - Incremental Game Generator`
        setDataSource("utility_function")
        foundGame = true
      }
    }

    // Method 3: Check for the specific game in localStorage using multiple methods
    if (!foundGame) {
      try {
        // First try the dedicated latest game storage
        const latestGameId = safeGetItem("latestGameId")
        const latestGame = safeGetItem("latestGame")

        if (latestGameId === gameId && latestGame) {
          const parsedGame = safeParse(latestGame, null)
          if (parsedGame) {
            console.log("Found game in latestGame storage")
            addLog("Found game in latestGame storage")
            setGameData(parsedGame)
            document.title = `${parsedGame.title} - Incremental Game Generator`
            setDataSource("latestGame")
            foundGame = true
          }
        }
        // Then try the full games array
        else {
          const storedGames = safeGetItem("generatedGames")
          console.log("Checking generatedGames in localStorage:", storedGames ? "Found" : "Not found")
          addLog(`Checking generatedGames in localStorage: ${storedGames ? "Found" : "Not found"}`)

          if (storedGames) {
            try {
              const games = safeParse(storedGames, [])
              if (!Array.isArray(games)) {
                throw new Error("Stored games is not an array")
              }

              console.log("Number of games found:", games.length)
              console.log("Looking for game with ID:", gameId)
              addLog(`Number of games found: ${games.length}`)
              addLog(`Looking for game with ID: ${gameId}`)
              addLog(`Available game IDs: ${games.map((g: any) => g.id).join(", ")}`)

              const game = games.find((g: any) => g.id === gameId)

              if (game) {
                console.log("Found game in generatedGames array:", game.title)
                addLog(`Found game in generatedGames array: ${game.title}`)
                setGameData(game)
                document.title = `${game.title} - Incremental Game Generator`
                setDataSource("generatedGames")
                foundGame = true
              }
            } catch (parseError) {
              console.error("Error parsing stored games:", parseError)
              addLog(
                `Error parsing stored games: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
              )
              setError(
                `Error parsing stored games: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
              )
            }
          }
        }
      } catch (err) {
        console.error("Error accessing localStorage:", err)
        addLog(`Error accessing localStorage: ${err instanceof Error ? err.message : String(err)}`)
        setError(`Error accessing localStorage: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Method 4: Check for minimal game data if other methods failed
    if (!foundGame) {
      try {
        const minimalGame = safeGetItem("minimalLatestGame")
        if (minimalGame) {
          const parsedGame = safeParse(minimalGame, null)
          if (parsedGame) {
            console.log("Found game in minimalLatestGame storage")
            addLog("Found game in minimalLatestGame storage")
            setGameData(parsedGame)
            document.title = `${parsedGame.title} - Incremental Game Generator`
            setDataSource("minimalLatestGame")
            foundGame = true
          }
        }
      } catch (err) {
        console.error("Error accessing minimal game data:", err)
        addLog(`Error accessing minimal game data: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Method 5: Add a function to attempt recovery if no game is found
    if (!foundGame) {
      // Last resort - check if any games exist and use the latest one
      try {
        const storedGames = safeGetItem("generatedGames")
        if (storedGames) {
          const games = safeParse(storedGames, [])
          if (Array.isArray(games) && games.length > 0) {
            // Use the most recent game as a fallback
            const latestGame = games[games.length - 1]
            console.log("No exact match found, using most recent game as fallback")
            addLog("No exact match found, using most recent game as fallback")
            setGameData(latestGame)
            document.title = `${latestGame.title} - Incremental Game Generator`
            setDataSource("fallback_most_recent")
            foundGame = true
          }
        }
      } catch (err) {
        console.error("Error in fallback game loading:", err)
        addLog(`Error in fallback game loading: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // If we still haven't found the game, show an error
    if (!foundGame) {
      console.error("Game not found with ID:", gameId)
      addLog(`Game not found with ID: ${gameId}`)
      setError(`Game not found with ID: ${gameId}. Please go back and try again.`)
    }

    setLoading(false)
  }, [params?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
          <p className="text-sm text-gray-500 mt-4">This may take a few moments...</p>
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
              <h1 className="text-2xl font-bold text-red-600 mb-2">Game Not Found</h1>
              <p className="text-gray-700 mb-6">{error}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/" passHref>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Home className="h-4 w-4 mr-2" />
                Return to Generator
              </Button>
            </Link>
            <Link href="/debug" passHref>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Bug className="h-4 w-4 mr-2" />
                Debug Storage
              </Button>
            </Link>
            <Button onClick={() => window.location.reload()} className="bg-gray-600 hover:bg-gray-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload
            </Button>
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading game...</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header with game title and controls */}
        <header className="bg-purple-900 text-white p-4 shadow-md">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl font-bold">{gameData?.title || "Game"}</h1>
              <p className="text-sm text-purple-200">{gameData?.description || "Interactive Game"}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/" passHref>
                <Button variant="outline" className="border-purple-500/50 hover:bg-purple-700/30 text-white">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Generator
                </Button>
              </Link>
              <Link href="/debug" passHref>
                <Button variant="outline" className="border-purple-500/50 hover:bg-purple-700/30 text-white">
                  <Bug className="h-4 w-4 mr-2" />
                  Debug
                </Button>
              </Link>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-700/30 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload
              </Button>
              <Button
                onClick={() => setDebugMode(!debugMode)}
                variant="outline"
                className={`border-purple-500/50 hover:bg-purple-700/30 ${debugMode ? "bg-purple-700/30" : ""}`}
              >
                <Bug className="h-4 w-4 mr-2" />
                {debugMode ? "Hide Debug" : "Debug Mode"}
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
                {gameData ? (
                  <DirectGameRenderer
                    html={gameData.html}
                    css={gameData.css}
                    js={gameData.js}
                    gameId={gameData.id}
                    debug={debugMode}
                    onLog={(message) => addLog(message)}
                    onError={(error) => setGameError(error)}
                    onLoaded={() => setGameLoaded(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">Loading game data...</p>
                  </div>
                )}
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
                  <EnhancedCodeViewer
                    code={gameData?.html || ""}
                    language="html"
                    fileName="game.html"
                    maxHeight="70vh"
                  />
                </TabsContent>

                <TabsContent value="css" className="m-0">
                  <EnhancedCodeViewer
                    code={gameData?.css || ""}
                    language="css"
                    fileName="styles.css"
                    maxHeight="70vh"
                  />
                </TabsContent>

                <TabsContent value="js" className="m-0">
                  <EnhancedCodeViewer
                    code={gameData?.js || ""}
                    language="javascript"
                    fileName="game.js"
                    maxHeight="70vh"
                  />
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
    </Suspense>
  )
}
